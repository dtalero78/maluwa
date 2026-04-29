"use client";

import { useEffect, useRef } from "react";

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  return (
    <div className="flex w-full items-end gap-3 rounded-2xl bg-[var(--color-paper)]/90 px-4 py-3 shadow-sm ring-1 ring-[var(--color-line)] backdrop-blur-sm focus-within:ring-[var(--color-accent)]">
      <textarea
        ref={ref}
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
  );
}
