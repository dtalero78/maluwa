"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import type { DiaryEntry } from "@/lib/diario/types";
import { Entry, TypingIndicator } from "./Entry";
import { Composer } from "./Composer";
import { PublishModal } from "./PublishModal";

interface DiaryProps {
  initialEntries: DiaryEntry[];
}

export function Diary({ initialEntries }: DiaryProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialEntries);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const hasSnapshot = entries.some((e) => e.kind === "snapshot");
  // Dos refs porque renderizamos dos contenedores (desktop / mobile) — usar
  // un único ref asignado a ambos hace que React lo deje apuntando al último
  // renderizado (mobile, oculto con `md:hidden`), y el scroll no surte
  // efecto en el visible.
  const feedRefDesktop = useRef<HTMLDivElement>(null);
  const feedRefMobile = useRef<HTMLDivElement>(null);

  // Scroll: cuando la IA agrega una respuesta nueva, llevamos al usuario al
  // INICIO de esa respuesta (no al fondo del feed). useLayoutEffect garantiza
  // que scrollHeight ya refleja el DOM nuevo antes del paint.
  useLayoutEffect(() => {
    let firstNewAiIndex = -1;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].kind === "answer") break;
      if (entries[i].role === "ai") firstNewAiIndex = i;
    }
    for (const el of [feedRefDesktop.current, feedRefMobile.current]) {
      if (!el) continue;
      if (firstNewAiIndex === -1) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        continue;
      }
      const target = el.querySelector<HTMLElement>(
        `[data-entry-idx="${firstNewAiIndex}"]`,
      );
      if (target) {
        const top = Math.max(0, target.offsetTop - 12);
        el.scrollTo({ top, behavior: "smooth" });
      } else {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }
  }, [entries, waiting]);

  async function send(answerText: string) {
    const trimmed = answerText.trim();
    if (!trimmed || waiting) return;

    const answer: DiaryEntry = {
      id: `local-${Date.now()}`,
      kind: "answer",
      role: "student",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    const nextEntries = [...entries, answer];
    setEntries(nextEntries);
    setDraft("");
    setWaiting(true);

    try {
      const res = await fetch("/api/diario/turno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: nextEntries }),
      });
      const data = (await res.json()) as { entries: DiaryEntry[] };
      for (const e of data.entries) {
        await new Promise((r) => setTimeout(r, 350));
        setEntries((curr) => [...curr, e]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWaiting(false);
    }
  }

  // Markup compartido del feed (se reusa en desktop/mobile con sus refs)
  const renderFeedAndComposer = (
    feedRef: React.RefObject<HTMLDivElement | null>,
  ) => (
    <>
      <div
        ref={feedRef}
        className="feed-scroll diary-ruled absolute inset-x-0 top-0 overflow-y-auto px-8 pt-6"
        style={{ bottom: "33%" }}
      >
        <div className="diary-feed-inner pb-6">
          {entries.map((entry, i) => (
            <div key={entry.id} data-entry-idx={i}>
              <Entry entry={entry} onSuggestionClick={(s) => send(s)} />
            </div>
          ))}
          {waiting && <TypingIndicator />}
        </div>
      </div>

      {/* Banda divisora naranja entre conversación y composer */}
      <div
        className="absolute inset-x-6 h-[3px] rounded-full bg-[var(--color-accent)]"
        style={{ bottom: "calc(33% + 18px)" }}
      />

      {/* Composer + (opcional) botón "publicar" */}
      <div
        className="absolute inset-x-0 bottom-0 px-8 pb-6"
        style={{ top: "67%" }}
      >
        <div className="flex h-full flex-col justify-center gap-2">
          {hasSnapshot && (
            <button
              type="button"
              onClick={() => setPublishOpen(true)}
              className="self-end rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-accent-deep)]"
            >
              publicar mi página →
            </button>
          )}
          <Composer
            value={draft}
            onChange={setDraft}
            onSubmit={() => send(draft)}
            disabled={waiting}
            placeholder={
              waiting ? "maluwa está escribiendo..." : "escribe aquí..."
            }
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full">
      {/* Header con logo flotando arriba a la izquierda */}
      <header className="flex items-center justify-between px-6 pt-5 md:px-10">
        <a href="/" aria-label="maluwa">
          <Image
            src="/logo-v2.png"
            alt="maluwa"
            width={384}
            height={140}
            priority
            className="h-12 w-auto md:h-14"
          />
        </a>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
          tu diario
        </p>
      </header>

      {/* DESKTOP: libreta abierta tipo "tablet en cubierta de cuero" */}
      <div className="hidden px-6 pt-2 pb-10 md:block">
        <div
          className="relative mx-auto flex w-full max-w-[1100px] overflow-hidden rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
          style={{ height: "min(78vh, 700px)" }}
        >
          {/* Cubierta izquierda — cuero marrón */}
          <div className="relative flex-[1] bg-[#b08d6a] border-r border-black/10">
            {/* Pequeño logo discreto en la esquina inferior */}
            <span
              aria-hidden
              className="absolute bottom-7 left-7 text-2xl opacity-30 grayscale"
            >
              👌
            </span>
          </div>

          {/* Tablet derecha — marco gris claro */}
          <div className="relative flex flex-[1.2] flex-col bg-[#f2f2f2] p-4">
            {/* Pantalla blanca */}
            <div className="relative flex-1 overflow-hidden rounded-[10px] bg-white shadow-[inset_0_0_5px_rgba(0,0,0,0.05)]">
              {renderFeedAndComposer(feedRefDesktop)}
            </div>

            {/* Stylus naranja sobresaliendo a la derecha */}
            <div
              aria-hidden
              className="absolute top-[18%] -right-[6px] h-[42%] w-[14px] rounded-r-[5px] bg-[#e09d37] shadow-[2px_0_5px_rgba(0,0,0,0.1)]"
            />
          </div>
        </div>
      </div>

      {/* Modal de publicar */}
      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />

      {/* MOBILE: solo la "pantalla" tablet sin la cubierta de cuero */}
      <div className="px-4 pt-2 pb-6 md:hidden">
        <div
          className="relative mx-auto w-full max-w-md overflow-hidden rounded-[16px] bg-[#f2f2f2] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          style={{ height: "min(75vh, 720px)" }}
        >
          <div className="relative h-full overflow-hidden rounded-[10px] bg-white shadow-[inset_0_0_5px_rgba(0,0,0,0.05)]">
            {renderFeedAndComposer(feedRefMobile)}
          </div>
        </div>
      </div>
    </div>
  );
}
