"use client";

import { useEffect, useRef, useState } from "react";

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  /** Llamado cuando una imagen se sube exitosamente. El padre debe
      enviar la siguiente "answer" con esa URL. */
  onImageUploaded?: (input: { url: string; mime: string }) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  onImageUploaded,
  disabled,
  placeholder,
}: ComposerProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/diario/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as
        | { ok: true; url: string; mime: string }
        | { ok: false; error: string };
      if (!data.ok) {
        setUploadError(data.error);
        return;
      }
      onImageUploaded?.({ url: data.url, mime: data.mime });
    } catch {
      setUploadError("no se pudo subir, prueba de nuevo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-end gap-2 rounded-2xl bg-[var(--color-paper)]/90 px-3 py-3 shadow-sm ring-1 ring-[var(--color-line)] backdrop-blur-sm focus-within:ring-[var(--color-accent)]">
        {/* Input de archivo oculto */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />

        {/* Botón 📷 para subir imagen */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          aria-label="subir foto"
          title="subir foto"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? (
            <svg
              className="animate-spin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.2-8.5" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </button>

        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!disabled && value.trim().length > 0) onSubmit();
            }
          }}
          placeholder={placeholder ?? "escribe aquí..."}
          rows={1}
          className="font-hand min-h-[36px] flex-1 resize-none bg-transparent text-[24px] leading-[36px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]/70 focus:outline-none"
        />
        <button
          type="button"
          disabled={disabled || value.trim().length === 0}
          onClick={onSubmit}
          aria-label="enviar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </button>
      </div>
      {uploadError && (
        <p className="mt-1 text-xs text-red-700">{uploadError}</p>
      )}
    </div>
  );
}
