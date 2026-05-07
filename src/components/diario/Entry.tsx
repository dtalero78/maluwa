import type { DiaryEntry, ResourceCard } from "@/lib/diario/types";

interface EntryProps {
  entry: DiaryEntry;
  /** Índice 1-based del resource entre todos los resources del feed.
   *  Sólo aplica si entry.kind === "resource". */
  resourceIndex?: number;
  onSuggestionClick?: (s: string) => void;
}

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];
function toRoman(n: number) {
  return ROMAN[n - 1] ?? String(n);
}

const RESOURCE_KIND_LABEL: Record<ResourceCard["kind"], string> = {
  palette: "paleta",
  checklist: "checklist",
  copy: "copy",
};

export function Entry({ entry, resourceIndex, onSuggestionClick }: EntryProps) {
  if (entry.kind === "question") {
    return (
      <article className="diary-entry diary-ai">
        <div className="speaker">maluwa</div>
        <p className="q">{entry.text}</p>
        {entry.hint && <p className="hint">{entry.hint}</p>}
        {entry.suggestions && entry.suggestions.length > 0 && (
          <div className="suggestions" role="group" aria-label="sugerencias">
            {entry.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="sug"
                onClick={() => onSuggestionClick?.(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </article>
    );
  }

  if (entry.kind === "answer") {
    const hasImage = Boolean(entry.imageUrl);
    const hasText = entry.text.trim().length > 0;
    return (
      <article className="diary-entry diary-me">
        <div className="speaker">{hasImage ? "tú · foto" : "tú"}</div>
        {hasText && <p>{entry.text}</p>}
        {hasImage && (
          <div className="photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.imageUrl!}
              alt="foto adjunta"
              loading="lazy"
            />
          </div>
        )}
      </article>
    );
  }

  if (entry.kind === "resource") {
    const card = entry.card;
    const label = RESOURCE_KIND_LABEL[card.kind];
    const vol = toRoman(resourceIndex ?? 1);
    const showIntro =
      entry.intro && entry.intro.trim() !== card.title.trim();

    if (card.kind === "palette") {
      return (
        <article
          className="diary-entry diary-res diary-res-palette"
          data-vol={vol}
        >
          <div className="label">{label}</div>
          <div className="title">{card.title}</div>
          {showIntro && <div className="intro">{entry.intro}</div>}
          <div className="swatches">
            {card.colors.map((c) => (
              <div className="sw" key={c}>
                <div className="chip" style={{ background: c }} />
                <div className="hex">{c.toLowerCase()}</div>
              </div>
            ))}
          </div>
          {card.note && <div className="note">{card.note}</div>}
        </article>
      );
    }

    if (card.kind === "checklist") {
      return (
        <article
          className="diary-entry diary-res diary-res-check"
          data-vol={vol}
        >
          <div className="label">{label}</div>
          <div className="title">{card.title}</div>
          {showIntro && <div className="intro">{entry.intro}</div>}
          <ul>
            {card.items.map((it) => (
              <li key={it}>
                <span className="box" aria-hidden="true" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </article>
      );
    }

    // copy
    return (
      <article
        className="diary-entry diary-res diary-res-copy"
        data-vol={vol}
      >
        <div className="label">{label}</div>
        <div className="title">{card.title}</div>
        {showIntro && <div className="intro">{entry.intro}</div>}
        <blockquote>{card.body}</blockquote>
      </article>
    );
  }

  if (entry.kind === "snapshot") {
    return (
      <article className="diary-entry diary-snap">
        <div className="label">avance</div>
        <div className="caption">{entry.caption}</div>
        <div className="frame">
          <div className="bar">
            <i />
            <i />
            <i />
            <span className="url">borrador · vol. 01</span>
          </div>
          <iframe
            srcDoc={`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>${entry.css}</style></head><body>${entry.html}</body></html>`}
            sandbox="allow-scripts"
            title="vista previa del proyecto"
          />
        </div>
      </article>
    );
  }

  return null;
}

export function TypingIndicator() {
  return (
    <div className="diary-typing" aria-live="polite">
      <span className="speaker">maluwa</span>
      <span className="dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="hint">leyendo lo que enviaste</span>
    </div>
  );
}
