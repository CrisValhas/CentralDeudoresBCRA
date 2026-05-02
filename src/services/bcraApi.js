const DEFAULT_BCRA_API_BASE = "/api/bcra/CentralDeDeudores/v1.0";

const BCRA_API_BASE =
  import.meta.env.VITE_BCRA_API_BASE || DEFAULT_BCRA_API_BASE;

function getErrorMessage(payload, fallback) {
  if (payload?.errorMessages?.length) {
    return payload.errorMessages.join(" ");
  }

  if (payload?.message) {
    return payload.message;
  }

  return fallback;
}

export async function fetchDeudas(identificacion, historical = false) {
  const digits = String(identificacion || "").replace(/\D/g, "");
  const path = historical ? "Deudas/Historicas" : "Deudas";
  const url = `${BCRA_API_BASE}/${path}/${encodeURIComponent(digits)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        `No se pudo consultar el BCRA (${response.status}).`
      )
    );
  }

  return payload?.results || payload;
}
