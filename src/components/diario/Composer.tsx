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
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
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

  const sendDisabled = disabled || value.trim().length === 0;

  return (
    <>
      <form
        className="diary-composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (!sendDisabled) onSubmit();
        }}
      >
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

        {/* Paperclip / upload — outline 18px, ink-soft */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          aria-label="adjuntar foto"
          title="adjuntar foto"
          className="clip"
        >
          {uploading ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.2-8.5" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3.5" />
              <path d="M7 10l5-5 5 5" />
              <path d="M12 5v12" />
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
              if (!sendDisabled) onSubmit();
            }
          }}
          placeholder={placeholder ?? "escribe aquí…"}
          rows={1}
          aria-label="escribí tu respuesta"
        />

        <button
          type="submit"
          disabled={sendDisabled}
          aria-label="enviar"
          className="send"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      {uploadError && (
        <span className="diary-composer-error">{uploadError}</span>
      )}
      <span className="diary-composer-meta">
        enter envía · shift+enter nueva línea
      </span>
    </>
  );
}
