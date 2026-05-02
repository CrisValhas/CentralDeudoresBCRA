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
        stroke="#15803d"
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
        stroke="#b91c1c"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SearchForm({ onSearch, loading }) {
  const [value, setValue] = useState("");
  const [historical, setHistorical] = useState(true);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  function onlyDigits(input) {
    return String(input || "").replace(/\D/g, "");
  }

  function formatVisual(input) {
    const digits = onlyDigits(input);
    if (!digits) return "";
    const part1 = digits.slice(0, 2);
    const part2 = digits.slice(2, 10);
    const part3 = digits.slice(10, 11);
    return [part1, part2, part3].filter(Boolean).join(" ");
  }

  const isValid = value.length === 11;

  function submit(event) {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSearch(value, historical);
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <div className="form-head">
        <label className="label" htmlFor="identificacion">
          Identificación (CUIT/CUIL/CDI)
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={historical}
            onChange={(event) => setHistorical(event.target.checked)}
          />
          Histórico
        </label>
      </div>

      <div className="input-embed">
        <div className="left-icon" aria-hidden>
          {isValid ? <IconCheck /> : value.length ? <IconX /> : null}
        </div>
        <input
          id="identificacion"
          className="input embedded"
          value={focused ? value : formatVisual(value)}
          onChange={(event) => {
            const raw = onlyDigits(event.target.value);
            setValue(raw.slice(0, 11));
          }}
          placeholder="Ej: 20 12345678 3"
          inputMode="numeric"
          onBlur={() => {
            setTouched(true);
            setFocused(false);
          }}
          onFocus={() => setFocused(true)}
          aria-invalid={touched && !isValid}
        />

        <button
          type="submit"
          className="btn primary embedded-btn"
          disabled={loading || !isValid}
        >
          {loading ? "Buscando" : "Buscar"}
        </button>
      </div>

      {touched && !isValid && (
        <div className="error">
          La identificación debe tener exactamente 11 dígitos numéricos.
        </div>
      )}
    </form>
  );
}
