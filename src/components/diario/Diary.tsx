"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { DiaryEntry, SnapshotEntry } from "@/lib/diario/types";
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
  const lastSnapshot = useMemo<SnapshotEntry | undefined>(() => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i];
      if (e.kind === "snapshot") return e;
    }
    return undefined;
  }, [entries]);

  // Numeración 1-based de cada resource para el data-vol (I, II, III…)
  const resourceIndexById = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    for (const e of entries) {
      if (e.kind === "resource") {
        n += 1;
        map.set(e.id, n);
      }
    }
    return map;
  }, [entries]);

  const feedRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Scroll: cuando la IA agrega una respuesta nueva, llevamos al usuario
  // al INICIO de esa respuesta. En el shell editorial el scroll vive en
  // el documento (no en un container interno), así que apuntamos a window.
  useLayoutEffect(() => {
    const wasFirst = isFirstRender.current;
    isFirstRender.current = false;

    let firstNewAiIndex = -1;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].kind === "answer") break;
      if (entries[i].role === "ai") firstNewAiIndex = i;
    }

    const feedEl = feedRef.current;
    if (!feedEl) return;

    if (wasFirst) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }

    if (firstNewAiIndex !== -1) {
      const target = feedEl.querySelector<HTMLElement>(
        `[data-entry-idx="${firstNewAiIndex}"]`,
      );
      if (target) {
        // Restamos ~80px para dejar espacio bajo el header sticky.
        const top = Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - 80,
        );
        window.scrollTo({ top, behavior: "smooth" });
        return;
      }
    }
    // Ningún nuevo AI: probablemente acabamos de mandar respuesta y
    // estamos esperando. Scroll al fondo para mostrar el typing indicator.
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
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

  const publishLabel = alreadyPublished
    ? "actualizar mi página →"
    : "publicar mi página →";

  return (
    <div className="diary-root">
      <div className="diary-shell">
        <div className="diary-feed-col">
          <header className="diary-top">
            <div className="brand">
              <Link href="/" aria-label="maluwa">
                <Image
                  src="/logo-v2.png"
                  alt="maluwa"
                  width={120}
                  height={44}
                  priority
                  style={{ height: 22, width: "auto" }}
                />
              </Link>
              <span className="crumb">
                diario <span className="sep">·</span>{" "}
                <span className="here">tu diario</span>
              </span>
            </div>
            {hasSnapshot ? (
              <button
                type="button"
                onClick={() => setPublishOpen(true)}
                className="diary-publish-btn"
                aria-label={publishLabel}
              >
                {publishLabel}
              </button>
            ) : (
              <button className="menu" aria-label="menú" type="button">
                ···
              </button>
            )}
          </header>

          <section className="diary-opener">
            <span className="vol">cuaderno · vol. 01</span>
            <span className="when">empezado hoy</span>
          </section>

          <main
            className="diary-feed"
            aria-label="conversación con la IA"
            ref={feedRef}
          >
            {entries.map((entry, i) => (
              <div key={entry.id} data-entry-idx={i}>
                <Entry
                  entry={entry}
                  resourceIndex={
                    entry.kind === "resource"
                      ? resourceIndexById.get(entry.id)
                      : undefined
                  }
                  onSuggestionClick={(s) => send(s)}
                />
              </div>
            ))}
            {waiting && <TypingIndicator />}
          </main>
        </div>

        {/* Sidebar desktop ≥1080px — preview del último snapshot */}
        <aside className="diary-side-col">
          <div className="diary-preview" aria-label="vista previa del borrador">
            <div className="head">
              <span className="label">borrador</span>
              {lastSnapshot && <span className="live">se actualiza solo</span>}
            </div>

            {lastSnapshot ? (
              <>
                <div className="browser">
                  <div className="bar">
                    <i />
                    <i />
                    <i />
                    <span className="url">
                      borrador.maluwa.app
                      <span className="draft-tag">· vol. 01 borrador</span>
                    </span>
                  </div>
                  <iframe
                    srcDoc={`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>${lastSnapshot.css}</style></head><body>${lastSnapshot.html}</body></html>`}
                    sandbox="allow-scripts"
                    title="vista previa del borrador"
                  />
                </div>
                <div className="footnote">
                  <span>sin publicar</span>
                  {hasSnapshot && (
                    <button
                      type="button"
                      onClick={() => setPublishOpen(true)}
                      className="diary-publish-btn"
                    >
                      {publishLabel}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="empty">
                vista previa aparecerá
                <br />
                cuando construyamos algo
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Composer fijo abajo */}
      <div className="diary-composer-wrap">
        <div className="diary-composer-inner">
          <Composer
            value={draft}
            onChange={setDraft}
            onSubmit={() => send(draft)}
            onImageUploaded={({ url, mime }) => sendImage(url, mime)}
            disabled={waiting}
            placeholder={
              waiting ? "maluwa está escribiendo…" : "escribe aquí…"
            }
          />
        </div>
      </div>

      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        alreadyPublishedUrl={publishedUrl ?? null}
      />
    </div>
  );
}
