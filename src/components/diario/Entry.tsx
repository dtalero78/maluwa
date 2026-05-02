import type { DiaryEntry } from "@/lib/diario/types";

interface EntryProps {
  entry: DiaryEntry;
  onSuggestionClick?: (s: string) => void;
}

/* Paleta de stickers tipo "notebook label" — colores saturados como en la
   referencia. `bg` es el fondo coloreado del label, `line` es el color de
   los renglones discontinuos del área blanca interior, `icon` es un emoji
   pequeño que se muestra a la izquierda. */
const STICKER_STYLES = [
  { bg: "#4fb3ff", line: "#88c9f9", icon: "📚" }, // azul
  { bg: "#57c595", line: "#a3e4c8", icon: "✏️" }, // verde
  { bg: "#f47fae", line: "#fbb4d0", icon: "💖" }, // rosa
  { bg: "#fbbf24", line: "#fde0a3", icon: "⭐" }, // amarillo
  { bg: "#a78bfa", line: "#d4c4ff", icon: "🎨" }, // violeta
  { bg: "#fb7d3f", line: "#fdb993", icon: "🔥" }, // naranja
];

function pickStickerStyle(seed: string) {
  // FNV-1a hash. Después de cada Math.imul el resultado es int32 con
  // signo, por eso forzamos a uint32 con `>>> 0` antes de tomar módulo.
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = (h ^ seed.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  const palette = STICKER_STYLES[h % STICKER_STYLES.length];
  // Tilt entre -2.5° y +2.5°, derivado del mismo hash para que sea estable.
  const tiltDeg = (((h >>> 8) % 11) - 5) * 0.5;
  return { ...palette, tiltDeg };
}

export function Entry({ entry, onSuggestionClick }: EntryProps) {
  if (entry.kind === "question") {
    return (
      <div className="entry-in mb-[36px]">
        <p className="text-[16px] text-[var(--color-ink)]">{entry.text}</p>
        {entry.hint && (
          <p className="text-[14px] text-[var(--color-ink-soft)] italic">
            {entry.hint}
          </p>
        )}
        {entry.suggestions && entry.suggestions.length > 0 && (
          <ul className="list-none">
            {entry.suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => onSuggestionClick?.(s)}
                  className="text-[15px] text-[var(--color-accent)] underline decoration-[var(--color-accent)]/30 underline-offset-4 transition hover:decoration-[var(--color-accent)]"
                >
                  · {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (entry.kind === "answer") {
    const sticker = pickStickerStyle(entry.id);
    const hasImage = Boolean(entry.imageUrl);
    const hasText = entry.text.trim().length > 0;
    return (
      <div className="entry-in mb-[36px] flex justify-end">
        <div
          className="sticker-answer relative flex max-w-[88%] items-stretch gap-3 overflow-hidden rounded-[18px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          style={{
            backgroundColor: sticker.bg,
            transform: `rotate(${sticker.tiltDeg}deg)`,
          }}
        >
          <span
            aria-hidden
            className="absolute -top-5 -left-5 h-20 w-20 rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          />
          <span
            aria-hidden
            className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-white text-3xl shadow-[3px_3px_0px_rgba(0,0,0,0.1)]"
          >
            {hasImage ? "📷" : sticker.icon}
          </span>
          <div className="relative z-10 flex-1 overflow-hidden rounded-xl bg-white">
            {hasImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.imageUrl!}
                alt="foto del estudiante"
                className="block max-h-[260px] w-full object-cover"
              />
            )}
            {hasText && (
              <div
                className="px-3 py-2"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='36' viewBox='0 0 400 36' preserveAspectRatio='none'><line x1='0' y1='32' x2='400' y2='32' stroke='${encodeURIComponent(sticker.line)}' stroke-width='2' stroke-dasharray='7,6'/></svg>")`,
                  backgroundSize: "100% 36px",
                  backgroundRepeat: "repeat",
                }}
              >
                <p
                  className="font-hand text-[26px] text-[var(--color-ink)]"
                  style={{ lineHeight: "36px" }}
                >
                  {entry.text}
                </p>
              </div>
            )}
            {!hasText && hasImage && (
              <p
                className="font-hand px-3 py-1 text-right text-[18px] text-[var(--color-ink-soft)]"
                style={{ lineHeight: "1.4" }}
              >
                (foto adjunta)
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (entry.kind === "resource") {
    return (
      <div className="entry-in">
        {entry.intro && (
          <p className="mb-3 text-base text-[var(--color-ink-soft)]">
            {entry.intro}
          </p>
        )}
        <ResourceCardView card={entry.card} />
      </div>
    );
  }

  if (entry.kind === "snapshot") {
    return (
      <div className="entry-in">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-mint)]">
          así va tu página
        </p>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)] italic">
          {entry.caption}
        </p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-sm">
          <iframe
            srcDoc={`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>${entry.css}</style></head><body>${entry.html}</body></html>`}
            sandbox="allow-scripts"
            className="block h-[480px] w-full"
            title="Vista previa del proyecto"
          />
        </div>
      </div>
    );
  }

  return null;
}

function ResourceCardView({
  card,
}: {
  card: Extract<DiaryEntry, { kind: "resource" }>["card"];
}) {
  if (card.kind === "palette") {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
        <p className="text-base font-medium text-[var(--color-ink)]">
          {card.title}
        </p>
        <div className="mt-3 flex gap-2">
          {card.colors.map((c) => (
            <div key={c} className="flex flex-col items-center gap-1">
              <div
                className="h-12 w-12 rounded-full border border-black/5 shadow-inner"
                style={{ backgroundColor: c }}
              />
              <span className="text-xs text-[var(--color-ink-soft)]">{c}</span>
            </div>
          ))}
        </div>
        {card.note && (
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            {card.note}
          </p>
        )}
      </div>
    );
  }

  if (card.kind === "checklist") {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
        <p className="text-base font-medium text-[var(--color-ink)]">
          {card.title}
        </p>
        <ul className="mt-3 space-y-2">
          {card.items.map((it) => (
            <li
              key={it}
              className="flex items-start gap-2 text-sm text-[var(--color-ink-soft)]"
            >
              <span className="mt-[2px] inline-block h-4 w-4 rounded-sm border border-[var(--color-line)] bg-white" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
      <p className="text-base font-medium text-[var(--color-ink)]">
        {card.title}
      </p>
      <p className="mt-2 text-sm whitespace-pre-wrap text-[var(--color-ink-soft)]">
        {card.body}
      </p>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="entry-in flex items-center gap-1.5">
      <span className="typing-dot inline-block h-2 w-2 rounded-full bg-[var(--color-ink-soft)]" />
      <span className="typing-dot inline-block h-2 w-2 rounded-full bg-[var(--color-ink-soft)]" />
      <span className="typing-dot inline-block h-2 w-2 rounded-full bg-[var(--color-ink-soft)]" />
    </div>
  );
}
