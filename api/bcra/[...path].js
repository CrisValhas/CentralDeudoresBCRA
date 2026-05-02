const BCRA_ORIGIN = "https://api.bcra.gob.ar";

export default async function handler(request, response) {
  const path = Array.isArray(request.query.path)
    ? request.query.path.join("/")
    : request.query.path || "";
  const query = new URLSearchParams(request.query);

  query.delete("path");

  const upstreamUrl = new URL(`/${path}`, BCRA_ORIGIN);
  query.forEach((value, key) => upstreamUrl.searchParams.append(key, value));

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    const body = await upstreamResponse.text();

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader(
      "Content-Type",
      upstreamResponse.headers.get("content-type") || "application/json"
    );
    response.status(upstreamResponse.status).send(body);
  } catch (error) {
    response.status(502).json({
      status: 502,
      errorMessages: [
        "No se pudo conectar con la API del BCRA desde el servidor.",
      ],
      detail: error.message,
    });
  }
}
