"use client";

/**
 * Lección única del tronco común — `/leccion`.
 *
 * Página de un solo scroll (no multi-step). Cuatro secciones:
 *   0. intro (eyebrow + h1 + subtítulo)
 *   1. qué es una página web (3 puntos en serif)
 *   2. qué hace la IA (3 puntos en serif)
 *   3. ejercicio interactivo: 2 inputs editables que actualizan
 *      en tiempo real un panel "preview" + un panel "código" HTML
 *   4. CTA final → POST /api/leccion/seen → /diario/<id>
 *
 * Estilo idéntico al `/empezar` y al diario: cream paper, ink texto,
 * coral acento. NO usa clases del landing — todo inline `style`.
 */

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  journalId: string | null;
}

const COLOR_CREAM = "#f4ecd6";
const COLOR_INK = "#1a1612";
const COLOR_INK_SOFT = "#4a4036";
const COLOR_INK_FAINT = "#897c66";
const COLOR_PAPER_INPUT = "#faf3df";
const COLOR_BORDER = "#d6c895";
const COLOR_CORAL = "#d97757";
const COLOR_CORAL_BG = "#f5d9c8";
const COLOR_CODE_BG = "#2a241d";
const COLOR_CODE_FG = "#f0e8d0";

const FONT_SERIF =
  "var(--font-serif-editorial), 'Source Serif 4', Georgia, serif";
const FONT_MONO =
  "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace";

const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: 11,
  letterSpacing: "0.08em",
  color: COLOR_INK_FAINT,
  textTransform: "lowercase",
  marginBottom: 12,
};

const h2Style: React.CSSProperties = {
  fontFamily: FONT_SERIF,
  fontSize: 24,
  lineHeight: 1.2,
  letterSpacing: "-0.015em",
  fontWeight: 500,
  color: COLOR_INK,
  marginBottom: 14,
  textTransform: "lowercase",
};

const paragraphStyle: React.CSSProperties = {
  fontFamily: FONT_SERIF,
  fontSize: 17,
  lineHeight: 1.6,
  color: COLOR_INK_SOFT,
  marginBottom: 14,
};

const inlineCodeStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: 14,
  background: COLOR_CORAL_BG,
  color: "#7a3a23",
  padding: "1px 6px",
  borderRadius: 4,
  whiteSpace: "nowrap",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.08em",
  color: COLOR_INK_FAINT,
  textTransform: "lowercase",
  marginBottom: 6,
  fontFamily: FONT_MONO,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: COLOR_PAPER_INPUT,
  color: COLOR_INK,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: 6,
  padding: "12px 14px",
  fontSize: 16,
  minHeight: 46,
  fontFamily: FONT_MONO,
  outline: "none",
  boxSizing: "border-box",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function Leccion({ journalId }: Props) {
  const router = useRouter();

  const [titulo, setTitulo] = useState("Panadería Doña María");
  const [boton, setBoton] = useState("Llamar por WhatsApp");
  const [advancing, setAdvancing] = useState(false);

  const html = `<h1>${escapeHtml(titulo)}</h1>\n<button>${escapeHtml(boton)}</button>`;

  async function advance() {
    if (advancing) return;
    setAdvancing(true);
    try {
      // Best-effort: si falla, igual mandamos al chico al diario.
      await fetch("/api/leccion/seen", { method: "POST" }).catch((err) => {
        console.error("[leccion] /api/leccion/seen falló:", err);
      });
    } finally {
      // /diario/[id] ignora el id y resuelve por cookie. Si no hay
       // journalId, usamos un placeholder — el segmento es decorativo.
      const target = (journalId ? `/diario/${journalId}` : "/diario/_") as Route;
      router.push(target);
    }
  }

  return (
    <div style={{ fontFamily: FONT_SERIF, color: COLOR_INK }}>
      {/* SECCIÓN 0 — Intro */}
      <section style={{ marginBottom: 36 }}>
        <div style={eyebrowStyle}>antes de arrancar · 10 min</div>
        <h1
          style={{
            fontFamily: FONT_SERIF,
            fontSize: "clamp(32px, 7vw, 44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontWeight: 500,
            color: COLOR_INK,
            margin: "0 0 14px",
            textTransform: "lowercase",
          }}
        >
          ¿qué es una página web, y cómo se hace con ia?
        </h1>
        <p
          style={{
            ...paragraphStyle,
            fontSize: 17,
            color: COLOR_INK_SOFT,
            marginBottom: 0,
          }}
        >
          leés esto rápido, jugás un toque, y ya entendés con qué vas a estar
          trabajando.
        </p>
      </section>

      <hr
        style={{
          border: 0,
          borderTop: `1px solid ${COLOR_BORDER}`,
          margin: "0 0 32px",
        }}
      />

      {/* SECCIÓN 1 — Qué es una página web */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={h2Style}>qué es una página web</h2>
        <p style={paragraphStyle}>
          una página web es texto, fotos y botones que cualquiera con internet
          puede ver. nada mágico — son cosas que ya conocés, pero ordenadas
          para que aparezcan en una pantalla de cualquier parte del mundo.
        </p>
        <p style={paragraphStyle}>
          cada página vive en una dirección — una{" "}
          <code style={inlineCodeStyle}>URL</code> — algo como{" "}
          <code style={inlineCodeStyle}>panaderia-doña-maria.maluwa.app</code>.
          esa es la "puerta" por la que entran tus visitantes.
        </p>
        <p style={paragraphStyle}>
          por debajo, la página está hecha con un lenguaje que la computadora
          entiende: <code style={inlineCodeStyle}>HTML</code>. ejemplo cercano:
          la página de la panadería de la cuadra que vas a hacer es exactamente
          eso — texto + foto + un botón de whatsapp.
        </p>
      </section>

      {/* SECCIÓN 2 — Qué hace la IA */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={h2Style}>qué hace la ia en este flujo</h2>
        <p style={paragraphStyle}>
          vos le contás qué querés en español. ella escribe el{" "}
          <code style={inlineCodeStyle}>HTML</code>. esa es la magia: no tenés
          que aprender a escribirlo de cero para arrancar.
        </p>
        <p style={paragraphStyle}>
          igual te lo va a mostrar a la derecha (preview) para que lo entiendas
          mientras hacés. cuando veás que cambiar una palabra cambia algo en
          pantalla, ya entendiste cómo funciona.
        </p>
        <p style={paragraphStyle}>
          y te pregunta. mucho. porque sin que vos le respondás, no sabe qué
          construir. por eso esto es un{" "}
          <strong style={{ color: COLOR_INK }}>diario</strong>, no un buscador.
        </p>
      </section>

      {/* SECCIÓN 3 — Ejercicio interactivo */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={h2Style}>probá vos: cambiá el texto y mirá qué pasa</h2>
        <p
          style={{
            ...paragraphStyle,
            fontSize: 15,
            marginBottom: 18,
          }}
        >
          editá los dos campos. el preview y el código se actualizan al toque.
        </p>

        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
          <div>
            <label htmlFor="leccion-titulo" style={labelStyle}>
              texto del título
            </label>
            <input
              id="leccion-titulo"
              type="text"
              maxLength={80}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="leccion-boton" style={labelStyle}>
              texto del botón
            </label>
            <input
              id="leccion-boton"
              type="text"
              maxLength={60}
              value={boton}
              onChange={(e) => setBoton(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr",
          }}
        >
          {/* Preview panel */}
          <div
            style={{
              border: `1px solid ${COLOR_BORDER}`,
              background: COLOR_PAPER_INPUT,
              borderRadius: 6,
              padding: "20px 18px",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              alignItems: "flex-start",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <div style={{ ...labelStyle, marginBottom: 0 }}>preview</div>
            <h1
              data-testid="leccion-preview-titulo"
              style={{
                fontFamily:
                  "var(--font-grotesk), system-ui, -apple-system, sans-serif",
                fontSize: "clamp(20px, 5vw, 26px)",
                fontWeight: 600,
                lineHeight: 1.2,
                color: COLOR_INK,
                margin: 0,
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            >
              {titulo || " "}
            </h1>
            <button
              type="button"
              data-testid="leccion-preview-boton"
              onClick={() => {
                /* botón demo, no hace nada */
              }}
              style={{
                background: COLOR_CORAL,
                color: "#fff",
                border: `1px solid ${COLOR_CORAL}`,
                borderRadius: 6,
                padding: "10px 16px",
                fontSize: 15,
                fontFamily:
                  "var(--font-grotesk), system-ui, -apple-system, sans-serif",
                cursor: "pointer",
                maxWidth: "100%",
                wordBreak: "break-word",
                whiteSpace: "normal",
                textAlign: "left",
              }}
            >
              {boton || " "}
            </button>
          </div>

          {/* Code panel */}
          <div
            style={{
              border: `1px solid ${COLOR_CODE_BG}`,
              background: COLOR_CODE_BG,
              borderRadius: 6,
              padding: "16px 18px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                ...labelStyle,
                color: "#a59778",
                marginBottom: 10,
              }}
            >
              código html
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              <code
                data-testid="leccion-code"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: COLOR_CODE_FG,
                }}
              >
                {html}
              </code>
            </pre>
          </div>
        </div>

        <p
          style={{
            ...paragraphStyle,
            fontSize: 14,
            color: COLOR_INK_FAINT,
            marginTop: 16,
            marginBottom: 0,
            fontStyle: "italic",
          }}
        >
          eso es todo. en el diario pasa lo mismo, pero la ia escribe el HTML
          por vos.
        </p>
      </section>

      <hr
        style={{
          border: 0,
          borderTop: `1px solid ${COLOR_BORDER}`,
          margin: "0 0 32px",
        }}
      />

      {/* SECCIÓN 4 — CTA */}
      <section style={{ marginBottom: 40 }}>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontSize: "clamp(22px, 5vw, 28px)",
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
            color: COLOR_INK,
            margin: "0 0 22px",
            fontWeight: 500,
          }}
        >
          listo. ya entendiste el espíritu. ahora construyamos algo real.
        </p>

        <button
          type="button"
          onClick={advance}
          disabled={advancing}
          style={{
            width: "100%",
            minHeight: 52,
            background: COLOR_INK,
            color: COLOR_CREAM,
            border: `1px solid ${COLOR_INK}`,
            borderRadius: 6,
            padding: "16px 20px",
            fontSize: 17,
            letterSpacing: "0.04em",
            textTransform: "lowercase",
            cursor: advancing ? "not-allowed" : "pointer",
            opacity: advancing ? 0.55 : 1,
            fontFamily: FONT_MONO,
          }}
        >
          {advancing ? "abriendo el diario…" : "entrar al diario →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            type="button"
            onClick={advance}
            disabled={advancing}
            style={{
              background: "transparent",
              border: 0,
              color: COLOR_INK_FAINT,
              fontFamily: FONT_MONO,
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "lowercase",
              cursor: advancing ? "not-allowed" : "pointer",
              padding: 8,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            ya sé esto, saltarme →
          </button>
        </div>
      </section>
    </div>
  );
}
