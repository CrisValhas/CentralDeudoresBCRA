import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function formatPeriodo(p) {
  if (!p) return "";
  const s = String(p);
  if (s.length === 6) return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
  return s;
}

function fmtMontoMilPesos(n) {
  if (n == null) return "$ 0 mil";
  const num = Number(n);
  if (Number.isNaN(num)) return `$ ${n} mil`;
  if (Number.isInteger(num)) return `$ ${num} mil`;
  return `$ ${Math.round(num * 10) / 10} mil`;
}

function situacionColor(code) {
  if (code === 0) return "green";
  if (code === 1) return "yellow";
  if (code >= 4) return "red";
  return "gray";
}

function groupByEntidad(periodos = []) {
  const map = new Map();
  periodos.forEach((p) => {
    const periodo = p.periodo;
    (p.entidades || []).forEach((ent) => {
      const key = ent.entidad || "Sin entidad";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ ...ent, periodo });
    });
  });
  const result = [];
  map.forEach((list, entidad) => {
    list.sort((a, b) => String(b.periodo).localeCompare(String(a.periodo)));
    result.push({ entidad, list });
  });
  return result;
}

function ChartHistory({ records = [] }) {
  if (!records || records.length <= 1) return null;

  const dataPoints = records
    .map((r) => {
      const p = String(r.periodo || "");
      if (p.length >= 6) {
        const y = Number(p.slice(0, 4));
        const m = Number(p.slice(4, 6)) - 1;
        return { x: new Date(y, m, 1), y: Number(r.monto || 0), raw: r };
      }
      const x = r.fechaSit1 ? new Date(r.fechaSit1) : new Date();
      return { x, y: Number(r.monto || 0), raw: r };
    })
    .sort((a, b) => a.x - b.x);

  const data = {
    datasets: [
      {
        label: "Monto (mil)",
        data: dataPoints,
        tension: 0.3,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.08)",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${fmtMontoMilPesos(ctx.parsed.y)}`,
          title: (items) => {
            const d = items[0];
            return new Date(d.parsed.x).toLocaleDateString();
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "month", tooltipFormat: "yyyy-MM" },
        grid: { display: false },
      },
      y: {
        ticks: { callback: (v) => `${v} mil` },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: 180, marginBottom: 8 }}>
      <Line data={data} options={options} />
    </div>
  );
}

function EntityRow({ entidad, records = [], idx = 0 }) {
  const [open, setOpen] = useState(false);
  const latest = records[0];
  const color = situacionColor(latest?.situacion);

  return (
    <div className="entity-row">
      <div className="entity-main">
        <div className="entity-info">
          <div className="ent-title">
            <span
              className="situ-dot"
              style={{
                background: color,
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: 6,
                marginRight: 8,
              }}
              aria-describedby={`situ-tooltip-${idx}`}
              tabIndex={0}
              title={`Situación ${latest?.situacion ?? "-"}`}
            />
            <span className="ent-title-text" style={{ fontWeight: 600 }}>
              {entidad}
            </span>

            <div
              role="tooltip"
              id={`situ-tooltip-${idx}`}
              className="situ-tooltip"
              aria-hidden
            >
              <div className="situ-tooltip-title">
                Situación crediticia: {latest?.situacion ?? "-"}
              </div>
              <div className="situ-tooltip-body">
                <li>0 = Normal</li>
                <li>1 = Observada</li>
                <li>4+ = Alto riesgo</li>
              </div>
            </div>
          </div>

          <div className="ent-sub">
            <span className="period">{formatPeriodo(latest?.periodo)}</span>
            <span className="dias-label">Deuda total informada:</span>
            <span className="dias">{fmtMontoMilPesos(latest?.monto)}</span>
            <span className="monto"></span>
            {latest?.procesoJud && (
              <span className="badge badge-jud">En proceso judicial</span>
            )}
            {latest?.enRevision && (
              <span className="badge badge-rev">En revisión</span>
            )}
            {latest?.fechaSit1 && (
              <span className="vence">Vence: {latest.fechaSit1}</span>
            )}
          </div>
        </div>

        {records.length > 1 && (
          <div className="right-meta">
            <button
              className="toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              {open ? "Ocultar historial" : `Ver historial`}
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="entity-history">
          <ChartHistory records={records} />
        </div>
      )}
    </div>
  );
}

export default function ResultCard({ data }) {
  if (!data) return null;
  const { identificacion, denominacion, periodos } = data;
  const grouped = useMemo(() => groupByEntidad(periodos), [periodos]);

  return (
    <section className="result-card">
      <div className="summary">
        <div className="summary-left">
          <div className="ident">{identificacion}</div>
          <div className="name">{denominacion}</div>
        </div>
      </div>

      <div className="entities-list">
        {grouped.length ? (
          grouped.map(({ entidad, list }, idx) => (
            <EntityRow key={idx} entidad={entidad} records={list} idx={idx} />
          ))
        ) : (
          <div className="no-periods">
            No existen periodos para la identificación consultada.
          </div>
        )}
      </div>
    </section>
  );
}
