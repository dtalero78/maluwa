"use client";

import { useState, type FormEvent } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // Full nav para que el server pueda leer la cookie recién seteada.
        window.location.href = "/mis-proyectos";
        return;
      }
      setError("email o contraseña no coinciden");
    } catch {
      setError("no pudimos conectar — revisá tu internet y probá de nuevo");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    letterSpacing: "0.08em",
    color: "#897c66",
    textTransform: "lowercase",
    marginBottom: 6,
    fontFamily:
      "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#faf3df",
    color: "#1a1612",
    border: "1px solid #d6c895",
    borderRadius: 6,
    padding: "12px 14px",
    fontSize: 16, // 16px evita zoom en iOS
    fontFamily:
      "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
    outline: "none",
  };

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "block" }}>
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="email" style={labelStyle}>
          email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          disabled={loading}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label htmlFor="password" style={labelStyle}>
          contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          disabled={loading}
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            fontSize: 13,
            color: "#a3422a",
            background: "#f5d9c8",
            border: "1px solid #d97757",
            padding: "10px 12px",
            borderRadius: 6,
            marginBottom: 16,
            fontFamily:
              "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        style={{
          width: "100%",
          background: "#1a1612",
          color: "#f4ecd6",
          border: "1px solid #1a1612",
          borderRadius: 6,
          padding: "14px 16px",
          fontSize: 15,
          letterSpacing: "0.04em",
          textTransform: "lowercase",
          cursor: loading || !email || !password ? "not-allowed" : "pointer",
          opacity: loading || !email || !password ? 0.55 : 1,
          fontFamily:
            "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {loading ? "entrando…" : "entrar"}
      </button>
    </form>
  );
}
