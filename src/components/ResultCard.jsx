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

function formatPeriodo(periodo) {
  if (!periodo) return "";
  const value = String(periodo);
  if (value.length === 6) return `${value.slice(0, 4)}-${value.slice(4, 6)}`;
  return value;
}

function fmtMontoMilPesos(value) {
  if (value == null) return "$ 0";

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return `$ ${value}`;
  const amount = Number.isInteger(numericValue)
    ? numericValue * 1000
    : Math.round(numericValue * 1000);

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function situacionColor(code) {
  if (code === 0 || code === 1) return "green";
  if (code === 2 || code === 3) return "yellow";
  if (code >= 4) return "red";
  return "gray";
}

function situacionLabel(code) {
  if (code === 0 || code === 1) return "Normal";
  if (code === 2 || code === 3) return "Observada";
  if (code >= 4) return "Alto riesgo";
  return "Sin calificación";
}

function groupByEntidad(periodos = []) {
  const map = new Map();

  periodos.forEach((periodoItem) => {
    const periodo = periodoItem.periodo;
    (periodoItem.entidades || []).forEach((entidadItem) => {
      const key = entidadItem.entidad || "Sin entidad";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ ...entidadItem, periodo });
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
    .map((record) => {
      const periodo = String(record.periodo || "");
      if (periodo.length >= 6) {
        const year = Number(periodo.slice(0, 4));
        const month = Number(periodo.slice(4, 6)) - 1;
        return {
          x: new Date(year, month, 1),
          y: Number(record.monto || 0),
        };
      }

      return {
        x: record.fechaSit1 ? new Date(record.fechaSit1) : new Date(),
        y: Number(record.monto || 0),
      };
    })
    .sort((a, b) => a.x - b.x);

  const data = {
    datasets: [
      {
        label: "Monto",
        data: dataPoints,
        tension: 0.32,
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.12)",
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
          label: (context) => fmtMontoMilPesos(context.parsed.y),
          title: (items) => {
            const item = items[0];
            return new Date(item.parsed.x).toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            });
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
        ticks: { callback: (tick) => `${tick} mil` },
        grid: { color: "rgba(100, 116, 139, 0.18)" },
      },
    },
  };

  return (
    <div className="chart-box">
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
              className={`situ-dot dot-${color}`}
              aria-describedby={`situ-tooltip-${idx}`}
              tabIndex={0}
              title={`Situación ${latest?.situacion ?? "-"}`}
            />
            <span className="ent-title-text">{entidad}</span>

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
                <div>0, 1 = Normal</div>
                <div>2, 3 = Observada</div>
                <div>4+ = Alto riesgo</div>
              </div>
            </div>
          </div>

          <div className="ent-sub">
            <span className={`risk-chip risk-${color}`}>
              {situacionLabel(latest?.situacion)}
            </span>
            <span className="period">{formatPeriodo(latest?.periodo)}</span>
            <span className="dias-label">Deuda total informada:</span>
            <span className="dias">{fmtMontoMilPesos(latest?.monto)}</span>
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
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
            >
              {open ? "Ocultar" : "Historial"}
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
  const total = grouped.reduce((sum, item) => {
    return sum + Number(item.list?.[0]?.monto || 0);
  }, 0);

  return (
    <section className="result-card">
      <div className="summary">
        <div className="summary-left">
          <div className="summary-label">Resultado</div>
          <div className="ident">{identificacion}</div>
          <div className="name">{denominacion || "Sin denominación informada"}</div>
        </div>
        <div className="summary-metrics">
          <div>
            <span>Entidades</span>
            <strong>{grouped.length}</strong>
          </div>
          <div>
            <span>Total último período</span>
            <strong>{fmtMontoMilPesos(total)}</strong>
          </div>
        </div>
      </div>

      <div className="entities-list">
        {grouped.length ? (
          grouped.map(({ entidad, list }, idx) => (
            <EntityRow key={entidad} entidad={entidad} records={list} idx={idx} />
          ))
        ) : (
          <div className="no-periods">
            No existen períodos para la identificación consultada.
          </div>
        )}
      </div>
    </section>
  );
}
