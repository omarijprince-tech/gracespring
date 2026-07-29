"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useLang } from "../../lib/lang-context";

function humanError(err, L) {
  const m = String(err?.message || err || "");
  if (/InvalidSecret|InvalidAccountId|Invalid credentials/i.test(m)) return L("Email or password is incorrect.", "El correo o la contraseña son incorrectos.");
  if (/already exists|account already/i.test(m)) return L("That email already has an account — try signing in instead.", "Ese correo ya tiene una cuenta — intenta iniciar sesión.");
  if (/rate limit|too many/i.test(m)) return L("Too many attempts — wait a minute and try again.", "Demasiados intentos — espera un minuto e inténtalo de nuevo.");
  if (/could not send/i.test(m)) return L("Couldn't send the email — double-check the address and try again.", "No se pudo enviar el correo — verifica la dirección e inténtalo de nuevo.");
  if (/verification code|invalid code|expired/i.test(m)) return L("That code didn't match — check the email or request a new code.", "Ese código no coincide — revisa el correo o pide uno nuevo.");
  if (/8 characters|password/i.test(m) && /short|least|weak/i.test(m)) return L("Password must be at least 8 characters.", "La contraseña debe tener al menos 8 caracteres.");
  return L("Something went wrong. Check your details and try again.", "Algo salió mal. Revisa tus datos e inténtalo de nuevo.");
}

/* Modes: signIn | signUp | forgot (request a code) | resetVerify (code + new password) */
export default function LoginClient() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { L } = useLang();
  const { isAuthenticated } = useConvexAuth();
  const [mode, setMode] = useState("signIn");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    router.replace("/account");
    return null;
  }

  const isIn = mode === "signIn";
  const switchMode = (m) => { setMode(m); setError(""); setNotice(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.target);
    setBusy(true);
    try {
      if (mode === "forgot") {
        const email = String(form.get("email")).trim().toLowerCase();
        await signIn("password", { email, flow: "reset" });
        setResetEmail(email);
        switchMode("resetVerify");
        setNotice(L(`We emailed an 8-digit code to ${email}.`, `Enviamos un código de 8 dígitos a ${email}.`));
      } else if (mode === "resetVerify") {
        const newPassword = String(form.get("newPassword"));
        if (newPassword.length < 8) { setError(L("Password must be at least 8 characters.", "La contraseña debe tener al menos 8 caracteres.")); setBusy(false); return; }
        await signIn("password", {
          email: resetEmail,
          code: String(form.get("code")).trim(),
          newPassword,
          flow: "reset-verification",
        });
        router.push("/account");
      } else {
        if (String(form.get("password")).length < 8) { setError(L("Password must be at least 8 characters.", "La contraseña debe tener al menos 8 caracteres.")); setBusy(false); return; }
        form.set("flow", mode);
        await signIn("password", form);
        router.push("/account");
      }
    } catch (err) {
      setError(humanError(err, L));
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    signIn: [L("Welcome back", "Qué bueno verte de nuevo"), L("Sign in to manage your deliveries and monthly refill.", "Inicia sesión para gestionar tus entregas y tu recarga mensual.")],
    signUp: [L("Create your account", "Crea tu cuenta"), L("One account for orders, monthly refill, and delivery preferences.", "Una cuenta para pedidos, recarga mensual y preferencias de entrega.")],
    forgot: [L("Reset your password", "Restablece tu contraseña"), L("Enter your account email and we'll send you a reset code.", "Escribe el correo de tu cuenta y te enviaremos un código.")],
    resetVerify: [L("Enter your reset code", "Ingresa tu código"), L("Use the 8-digit code from your email and pick a new password.", "Usa el código de 8 dígitos de tu correo y elige una nueva contraseña.")],
  };
  const buttonLabels = {
    signIn: L("Sign In", "Iniciar sesión"), signUp: L("Create Account", "Crear cuenta"),
    forgot: L("Send Reset Code", "Enviar código"), resetVerify: L("Set New Password", "Guardar nueva contraseña"),
  };

  return (
    <div className="panel auth-panel">
      {(mode === "signIn" || mode === "signUp") && (
        <div className="auth-tabs" role="tablist" aria-label={L("Sign in or create an account", "Inicia sesión o crea una cuenta")}>
          <button className={isIn ? "active" : ""} role="tab" aria-selected={isIn} onClick={() => switchMode("signIn")}>{L("Sign In", "Iniciar sesión")}</button>
          <button className={isIn ? "" : "active"} role="tab" aria-selected={!isIn} onClick={() => switchMode("signUp")}>{L("Create Account", "Crear cuenta")}</button>
        </div>
      )}

      <h1 style={{ fontSize: "1.35rem", margin: "18px 0 4px" }}>{titles[mode][0]}</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: 18 }}>{titles[mode][1]}</p>

      <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
        {(mode === "signIn" || mode === "signUp" || mode === "forgot") && (
          <div className="field full">
            <label htmlFor="authEmail">{L("Email", "Correo electrónico")}</label>
            <input id="authEmail" name="email" type="email" autoComplete="email" required placeholder={L("you@example.com", "tu@ejemplo.com")} />
          </div>
        )}
        {(mode === "signIn" || mode === "signUp") && (
          <div className="field full">
            <label htmlFor="authPassword">{L("Password", "Contraseña")}</label>
            <input id="authPassword" name="password" type="password"
              autoComplete={isIn ? "current-password" : "new-password"}
              required minLength={8} placeholder={L("At least 8 characters", "Mínimo 8 caracteres")} />
          </div>
        )}
        {mode === "resetVerify" && (
          <>
            <div className="field full">
              <label htmlFor="resetCode">{L("Reset code", "Código")}</label>
              <input id="resetCode" name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder={L("8-digit code from your email", "Código de 8 dígitos de tu correo")} />
            </div>
            <div className="field full">
              <label htmlFor="newPassword">{L("New password", "Nueva contraseña")}</label>
              <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} placeholder={L("At least 8 characters", "Mínimo 8 caracteres")} />
            </div>
          </>
        )}

        {notice && <p className="field-hint" style={{ color: "var(--success)" }}>{notice}</p>}
        {error && <p className="field-hint" role="alert" style={{ color: "#b91c1c" }}>{error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? L("Working…", "Procesando…") : buttonLabels[mode]}
        </button>
      </form>

      <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 14 }}>
        {mode === "signIn" && (
          <button className="linklike" onClick={() => switchMode("forgot")} type="button">{L("Forgot your password?", "¿Olvidaste tu contraseña?")}</button>
        )}
        {mode === "signUp" && L("Already have an account? Use the Sign In tab.", "¿Ya tienes cuenta? Usa la pestaña Iniciar sesión.")}
        {(mode === "forgot" || mode === "resetVerify") && (
          <button className="linklike" onClick={() => switchMode("signIn")} type="button">{L("← Back to sign in", "← Volver a iniciar sesión")}</button>
        )}
      </p>
    </div>
  );
}
