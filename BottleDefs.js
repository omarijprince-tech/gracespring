"use client";

/* First-visit language chooser. Shows once (no stored preference), then the
   header toggle takes over. Pre-highlights Español when the browser is set
   to Spanish. */

import { useEffect, useState } from "react";
import { useLang } from "../lib/lang-context";

export default function LanguageGate() {
  const { needsChoice, hydrated, setLang } = useLang();
  const [suggestEs, setSuggestEs] = useState(false);

  useEffect(() => {
    setSuggestEs((navigator.language || "").toLowerCase().startsWith("es"));
  }, []);

  if (!hydrated || !needsChoice) return null;

  const primary = { flexDirection: "column", gap: 2, padding: "16px 10px" };

  return (
    <div className="lang-gate-overlay" role="dialog" aria-modal="true" aria-label="Language / Idioma">
      <div className="lang-gate panel">
        <img src="/assets/logo-mark.png" alt="" width="52" height="52" style={{ margin: "0 auto 10px" }} />
        <h1 style={{ fontSize: "1.15rem", marginBottom: 2 }}>Welcome · Bienvenido</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 16 }}>
          Choose your language · Elige tu idioma
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button className={suggestEs ? "btn btn-outline" : "btn btn-primary"} style={primary} onClick={() => setLang("en")}>
            English
          </button>
          <button className={suggestEs ? "btn btn-primary" : "btn btn-outline"} style={primary} onClick={() => setLang("es")}>
            Español
          </button>
        </div>
      </div>
    </div>
  );
}
