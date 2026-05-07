"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { DiaryEntry } from "@/lib/diario/types";
import { Entry, TypingIndicator } from "./Entry";
import { Composer } from "./Composer";
import { PublishModal } from "./PublishModal";

interface DiaryProps {
  initialEntries: DiaryEntry[];
  /** Si el journal ya está publicado, su URL relativa (/u/<slug>). */
  publishedUrl?: string | null;
}

export function Diary({ initialEntries, publishedUrl }: DiaryProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialEntries);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const alreadyPublished = Boolean(publishedUrl);

  const hasSnapshot = entries.some((e) => e.kind === "snapshot");
  // Dos refs porque renderizamos dos contenedores (desktop / mobile) — usar
  // un único ref asignado a ambos hace que React lo deje apuntando al último
  // renderizado (mobile, oculto con `md:hidden`), y el scroll no surte
  // efecto en el visible.
  const feedRefDesktop = useRef<HTMLDivElement>(null);
  const feedRefMobile = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Scroll: cuando la IA agrega una respuesta nueva, llevamos al usuario
  // al INICIO de esa respuesta. En el primer render usamos scrollTop
  // síncrono (sin smooth) porque en mobile la animación smooth hace que
  // el browser "siga" la animación scrolleando el body — y la página
  // aparece anclada en el composer abajo en lugar del logo arriba.
  useLayoutEffect(() => {
    const wasFirst = isFirstRender.current;
    isFirstRender.current = false;

    let firstNewAiIndex = -1;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].kind === "answer") break;
      if (entries[i].role === "ai") firstNewAiIndex = i;
    }
    for (const el of [feedRefDesktop.current, feedRefMobile.current]) {
      if (!el) continue;
      let top = el.scrollHeight;
      if (firstNewAiIndex !== -1) {
        const target = el.querySelector<HTMLElement>(
          `[data-entry-idx="${firstNewAiIndex}"]`,
        );
        if (target) top = Math.max(0, target.offsetTop - 12);
      }
      if (wasFirst) {
        el.scrollTop = top;
      } else {
        el.scrollTo({ top, behavior: "smooth" });
      }
    }

    // En mobile, además, garantizamos que el scroll del documento esté
    // arriba: si el browser intentó compensar al montar, lo regresamos.
    if (wasFirst && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [entries, waiting]);

  async function pushAnswerAndAskNext(answer: DiaryEntry) {
    const nextEntries = [...entries, answer];
    setEntries(nextEntries);
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

  async function send(answerText: string) {
    const trimmed = answerText.trim();
    if (!trimmed || waiting) return;
    setDraft("");
    await pushAnswerAndAskNext({
      id: `local-${Date.now()}`,
      kind: "answer",
      role: "student",
      text: trimmed,
      createdAt: new Date().toISOString(),
    });
  }

  async function sendImage(url: string, mime: string) {
    if (waiting) return;
    await pushAnswerAndAskNext({
      id: `local-${Date.now()}`,
      kind: "answer",
      role: "student",
      text: "",
      imageUrl: url,
      imageMime: mime,
      createdAt: new Date().toISOString(),
    });
  }

  // Markup compartido del feed (se reusa en desktop/mobile con sus refs)
  const renderFeedAndComposer = (
    feedRef: React.RefObject<HTMLDivElement | null>,
  ) => (
    <>
      <div
        ref={feedRef}
        className="feed-scroll diary-ruled absolute inset-x-0 top-0 overflow-y-auto px-8 pt-6 pb-4"
        style={{ bottom: "20%" }}
      >
        <div className="diary-feed-inner">
          {entries.map((entry, i) => (
            <div key={entry.id} data-entry-idx={i}>
              <Entry entry={entry} onSuggestionClick={(s) => send(s)} />
            </div>
          ))}
          {waiting && <TypingIndicator />}
        </div>
      </div>

      {/* Composer + (opcional) botón "publicar" */}
      <div
        className="absolute inset-x-0 bottom-0 px-8 pb-4"
        style={{ top: "80%" }}
      >
        <div className="flex h-full flex-col justify-end gap-2">
          {hasSnapshot && (
            <button
              type="button"
              onClick={() => setPublishOpen(true)}
              className="self-end rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-accent-deep)]"
            >
              {alreadyPublished ? "actualizar mi página →" : "publicar mi página →"}
            </button>
          )}
          <Composer
            value={draft}
            onChange={setDraft}
            onSubmit={() => send(draft)}
            onImageUploaded={({ url, mime }) => sendImage(url, mime)}
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
        <Link href="/" aria-label="maluwa">
          <Image
            src="/logo-v2.png"
            alt="maluwa"
            width={384}
            height={140}
            priority
            className="h-12 w-auto md:h-14"
          />
        </Link>
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
      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        alreadyPublishedUrl={publishedUrl ?? null}
      />

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
