import React, { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";
import { fetchDeudas as fetchDeudasFromBcra } from "./services/bcraApi";
import BCRA from "../src/unnamed.jpg";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useState(prefersDark ? "dark" : "light");
  const [lastHistorical, setLastHistorical] = useState(true);
  const [lastSearch, setLastSearch] = useState("");

  async function fetchDeudas(identificacion, historical = false) {
    setLoading(true);
    setError(null);
    setData(null);
    setLastSearch(identificacion);

    try {
      const result = await fetchDeudasFromBcra(identificacion, historical);
      setData(result);
      setLastHistorical(historical);
    } catch (err) {
      setError(err.message || "No se pudo completar la consulta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`app-root theme-${theme}`}>
      <header className="header">
        <button className="brand" type="button" onClick={() => location.reload()}>
          <img src={BCRA} alt="" className="brand-logo" />
          <span>
            <span className="brand-eyebrow">BCRA</span>
            <span className="app-title">Central de Deudores</span>
          </span>
        </button>

        <div className="header-actions">
          <label className="header-toggle" title="Cambiar tema">
            <input
              type="checkbox"
              onChange={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
              checked={theme === "dark"}
            />
            <span className="switch" aria-hidden />
          </label>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">Consulta pública</p>
            <h1>Buscá deuda informada por CUIT, CUIL o CDI</h1>
            <p>
              Visualizá entidades, situación crediticia, saldos informados y la
              evolución de los últimos períodos disponibles.
            </p>
          </div>
          <SearchForm onSearch={fetchDeudas} loading={loading} />
        </section>

        <section className="status-strip" aria-label="Información del servicio">
          <div>
            <span>Fuente</span>
            <strong>API oficial BCRA</strong>
          </div>
          <div>
            <span>Consulta</span>
            <strong>{lastHistorical ? "Histórica" : "Último período"}</strong>
          </div>
          <div>
            <span>Identificación</span>
            <strong>{lastSearch || "Sin consulta"}</strong>
          </div>
        </section>

        {loading && <div className="panel-state">Consultando información...</div>}

        {error && <div className="error">{error}</div>}

        {data && <ResultCard data={data} historicalQuery={lastHistorical} />}
      </main>

      <footer className="footer">
        <a
          href="https://www.linkedin.com/in/cristian-valtelhas-software-engineer"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered By Cristian Valtelhas
        </a>
      </footer>
    </div>
  );
}
