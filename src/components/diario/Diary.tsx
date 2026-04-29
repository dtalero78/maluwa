"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import type { DiaryEntry } from "@/lib/diario/types";
import { Entry, TypingIndicator } from "./Entry";
import { Composer } from "./Composer";

interface DiaryProps {
  initialEntries: DiaryEntry[];
}

export function Diary({ initialEntries }: DiaryProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialEntries);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  // Dos refs porque renderizamos dos contenedores (desktop / mobile) — usar
  // un único ref asignado a ambos hace que React lo deje apuntando al último
  // renderizado, que estaba oculto con `md:hidden`, y el scroll no surtía
  // efecto en el visible.
  const feedRefDesktop = useRef<HTMLDivElement>(null);
  const feedRefMobile = useRef<HTMLDivElement>(null);

  // Scroll al fondo cada vez que aparece una nueva entrada. useLayoutEffect
  // se ejecuta tras cada DOM mutation y antes del paint, así scrollHeight
  // ya refleja el contenido recién añadido.
  useLayoutEffect(() => {
    for (const el of [feedRefDesktop.current, feedRefMobile.current]) {
      if (!el) continue;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
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

  return (
    <div className="min-h-screen w-full">
      {/* Header con logo flotando arriba a la izquierda — fuera del libro */}
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

      {/* DESKTOP: libreta abierta, centrada, con margen alrededor */}
      <div className="hidden px-6 pt-2 pb-10 md:block">
        <div
          className="relative mx-auto w-full max-w-[1180px]"
          style={{ aspectRatio: "16 / 10" }}
        >
          {/* La libreta como ilustración de fondo */}
          <Image
            src="/notebook/notebook-desktop.svg"
            alt=""
            fill
            priority
            sizes="(min-width: 1180px) 1180px, 100vw"
            className="pointer-events-none select-none object-contain"
            aria-hidden
          />

          {/* Página derecha — conversación */}
          <div
            className="absolute z-10"
            style={{
              left: "50%",
              right: "9.03%",
              top: "7.78%",
              bottom: "7.78%",
            }}
          >
            <div className="relative h-full w-full">
              {/* Feed: arriba del divider naranja (~65%). Los renglones del cuaderno
                  se dibujan con un repeating-linear-gradient atado al line-height
                  del texto, así cualquier párrafo cae limpio sobre la línea. */}
              <div
                ref={feedRefDesktop}
                className="feed-scroll diary-ruled absolute inset-x-0 top-0 overflow-y-auto"
                style={{
                  bottom: "37%",
                  paddingLeft: "11%",
                  paddingRight: "11%",
                }}
              >
                <div className="diary-feed-inner pt-[36px] pb-6">
                  {entries.map((entry) => (
                    <Entry
                      key={entry.id}
                      entry={entry}
                      onSuggestionClick={(s) => send(s)}
                    />
                  ))}
                  {waiting && <TypingIndicator />}
                </div>
              </div>

              {/* Composer: abajo del divider */}
              <div
                className="absolute inset-x-0 bottom-0"
                style={{
                  top: "67%",
                  paddingLeft: "11%",
                  paddingRight: "11%",
                }}
              >
                <div className="flex h-full items-center">
                  <Composer
                    value={draft}
                    onChange={setDraft}
                    onSubmit={() => send(draft)}
                    disabled={waiting}
                    placeholder={
                      waiting
                        ? "maluwa está escribiendo..."
                        : "escribe aquí..."
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE: solo página suelta, también centrada con margen */}
      <div className="md:hidden px-4 pt-2 pb-6">
        <div
          className="relative mx-auto w-full max-w-md"
          style={{ aspectRatio: "9 / 16" }}
        >
          <Image
            src="/notebook/page-mobile.svg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none select-none object-contain"
            aria-hidden
          />

          <div className="absolute inset-0 z-10">
            <div className="relative h-full w-full">
              <div
                ref={feedRefMobile}
                className="feed-scroll diary-ruled absolute inset-x-0 top-0 overflow-y-auto"
                style={{
                  bottom: "32%",
                  paddingLeft: "12%",
                  paddingRight: "12%",
                }}
              >
                <div className="diary-feed-inner pt-[40px] pb-4">
                  {entries.map((entry) => (
                    <Entry
                      key={entry.id}
                      entry={entry}
                      onSuggestionClick={(s) => send(s)}
                    />
                  ))}
                  {waiting && <TypingIndicator />}
                </div>
              </div>

              <div
                className="absolute inset-x-0 bottom-0 pb-6"
                style={{
                  top: "70%",
                  paddingLeft: "12%",
                  paddingRight: "12%",
                }}
              >
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
          </div>
        </div>
      </div>
    </div>
  );
}
