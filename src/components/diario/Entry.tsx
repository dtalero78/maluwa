import type { DiaryEntry } from "@/lib/diario/types";

interface EntryProps {
  entry: DiaryEntry;
  onSuggestionClick?: (s: string) => void;
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
    return (
      <div className="entry-in mb-[36px]">
        <p className="font-hand text-right text-[28px] text-[var(--color-ink)]">
          {entry.text}
        </p>
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
            srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${entry.css}</style></head><body>${entry.html}</body></html>`}
            sandbox=""
            className="block h-[420px] w-full"
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
