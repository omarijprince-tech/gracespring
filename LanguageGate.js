"use client";

import { useState } from "react";
import { checkZip } from "../lib/catalog";
import { track } from "../lib/analytics";
import { useLang } from "../lib/lang-context";

export default function ZipChecker({ buttonLabel, note }) {
  const { L } = useLang();
  const [zip, setZip] = useState("");
  const [result, setResult] = useState(null); // { ok, text }

  const submit = (e) => {
    e.preventDefault();
    const z = zip.trim();
    if (!/^\d{5}$/.test(z)) {
      setResult({ ok: false, text: L("Please enter a valid 5-digit ZIP code.", "Ingresa un código postal válido de 5 dígitos.") });
      return;
    }
    if (checkZip(z)) {
      setResult({ ok: true, text: L(`✓ Great news — we deliver to ${z}! Pick your delivery window at checkout.`,
                                    `✓ ¡Buenas noticias — entregamos en ${z}! Elige tu horario al pagar.`) });
    } else {
      setResult({ ok: false, text: L(`We're not in ${z} yet — we're expanding! Check back soon.`,
                                     `Todavía no llegamos a ${z} — ¡estamos creciendo! Vuelve pronto.`) });
      track("address_rejected", { zip: z });
    }
    track("delivery_zip_checked", { zip: z, eligible: checkZip(z) });
  };

  return (
    <>
      <form className="zip-form" onSubmit={submit}>
        <label className="skip-link" htmlFor="zipInput">{L("ZIP code", "Código postal")}</label>
        <input
          id="zipInput" name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5}
          placeholder={L("Enter your ZIP code", "Escribe tu código postal")} required
          value={zip} onChange={(e) => setZip(e.target.value)}
        />
        <button className="btn btn-light" type="submit">{buttonLabel ?? L("Check", "Verificar")}</button>
      </form>
      <p className={`zip-result${result ? (result.ok ? " ok" : " no") : ""}`} aria-live="polite">
        {result?.text}
      </p>
      <p className="placeholder-note">
        {note ?? L("Delivering across northern New Jersey and the NYC metro area — Manhattan, Brooklyn, Queens, the Bronx, and Staten Island.",
                   "Entregamos en el norte de Nueva Jersey y el área metropolitana de NYC — Manhattan, Brooklyn, Queens, el Bronx y Staten Island.")}
      </p>
    </>
  );
}
