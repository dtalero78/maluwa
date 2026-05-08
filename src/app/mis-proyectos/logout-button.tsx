"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignoramos — la cookie igual se intenta limpiar y el redirect da
      // la apariencia de logout. Si la sesión sigue por algo raro, el
      // usuario puede volver a clickear.
    }
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="font-mono"
      style={{
        background: "transparent",
        color: "#4a4036",
        border: "1px solid #d6c895",
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: 12,
        letterSpacing: "0.04em",
        textTransform: "lowercase",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.55 : 1,
      }}
    >
      {loading ? "saliendo…" : "cerrar sesión"}
    </button>
  );
}
