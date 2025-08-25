import React, { useState } from "react";

function IconCheck() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="#059669"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="#dc2626"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SearchForm({ onSearch, loading }) {
  const [value, setValue] = useState(""); // raw digits
  const [historical, setHistorical] = useState(true);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  function onlyDigits(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function formatVisual(s) {
    const d = onlyDigits(s);
    if (!d) return "";
    const part1 = d.slice(0, 2);
    const part2 = d.slice(2, 10);
    const part3 = d.slice(10, 11);
    return [part1, part2, part3].filter(Boolean).join(" ");
  }

  const isValid = value.length === 11;

  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSearch(value, historical);
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <label className="label">Identificación (CUIT/CUIL/CDI)</label>
      </div>

      <div className="input-embed">
        <div className="left-icon" aria-hidden>
          {isValid ? <IconCheck /> : value.length ? <IconX /> : null}
        </div>
        <input
          className="input embedded"
          value={focused ? value : formatVisual(value)}
          onChange={(e) => {
            const raw = onlyDigits(e.target.value);
            setValue(raw.slice(0, 11));
          }}
          placeholder="Ej: 20 12345678 3"
          inputMode="numeric"
          onBlur={() => {
            setTouched(true);
            setFocused(false);
          }}
          onFocus={() => setFocused(true)}
          aria-invalid={!isValid}
        />

        <button
          type="submit"
          className="btn primary embedded-btn"
          disabled={loading || !isValid}
        >
          {loading ? "..." : "Buscar"}
        </button>
      </div>

      {touched && !isValid && (
        <div className="error">
          La identificación debe tener exactamente 11 dígitos numéricos.
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={historical}
            onChange={(e) => setHistorical(e.target.checked)}
          />
          Histórico
        </label>
      </div>
    </form>
  );
}
