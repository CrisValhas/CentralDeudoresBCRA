import React, { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // default to system preference; toggle overrides
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useState(prefersDark ? "dark" : "light");
  const [lastHistorical, setLastHistorical] = useState(false);

  async function fetchDeudas(identificacion, historical = false) {
    setLoading(true);
    setError(null);
    setData(null);
    const base = "https://api.bcra.gob.ar/centraldedeudores/v1.0";
    const path = historical ? "Deudas/Historicas" : "Deudas";
    try {
      const res = await fetch(
        `${base}/${path}/${encodeURIComponent(identificacion)}`
      );
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json.results || json);
      setLastHistorical(historical);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`app-root theme-${theme}`}>
      <header className="header">
        <div className="app-title">Buscador deudas BCRA</div>
        <div style={{ marginLeft: "auto" }}>
          <label className="header-toggle">
            <input
              type="checkbox"
              onChange={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              checked={theme === "dark"}
            />
            <span className="switch" aria-hidden />
          </label>
        </div>
      </header>

      <main className="container">
        <div className="hero">
          <SearchForm onSearch={fetchDeudas} loading={loading} />
        </div>

        <div className="app-summary">
          Esta aplicación consulta el servicio del BCRA y muestra deudas por
          entidad; la tarjeta muestra el monto total adeudado informado por la
          entidad para el periodo más reciente y, al desplegar, verás las
          declaraciones mensuales que la entidad reportó.
        </div>

        {error && <div className="error">{error}</div>}

        {data && <ResultCard data={data} historicalQuery={lastHistorical} />}

        {!data && !loading && (
          <div className="hint">
            Ingrese una identificación y presione "Buscar" para ver resultados.
          </div>
        )}
      </main>

      <footer className="footer">
        <a
          href="www.linkedin.com/in/cristian-valtelhas-software-engineer"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Powered By Cristian Valtelhas
        </a>
      </footer>
    </div>
  );
}
