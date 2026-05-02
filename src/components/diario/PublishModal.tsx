"use client";

import { useEffect, useState } from "react";

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
}

interface PublishOk {
  ok: true;
  url: string;
  fullUrl: string;
}
interface PublishErr {
  ok: false;
  error: string;
}
type PublishResp = PublishOk | PublishErr;

export function PublishModal({ open, onClose }: PublishModalProps) {
  const [state, setState] = useState<{
    email: string;
    password: string;
    slug: string;
    age: string;
    parent_email: string;
    name: string;
    accepted_terms: boolean;
  }>({
    email: "",
    password: "",
    slug: "",
    age: "",
    parent_email: "",
    name: "",
    accepted_terms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<PublishOk | null>(null);

  useEffect(() => {
    if (!open) {
      setErrorMsg(null);
      setSuccess(null);
    }
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof typeof state>(
    k: K,
    v: (typeof state)[K],
  ) => setState((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/diario/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
          slug: state.slug,
          age: state.age ? Number(state.age) : undefined,
          parent_email: state.parent_email,
          name: state.name || undefined,
          accepted_terms: state.accepted_terms,
        }),
      });
      const data = (await res.json()) as PublishResp;
      if (data.ok) setSuccess(data);
      else setErrorMsg(data.error);
    } catch {
      setErrorMsg("falló la conexión, intenta de nuevo");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--color-paper)] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="cerrar"
          className="absolute top-3 right-3 h-8 w-8 rounded-full text-[var(--color-ink-soft)] hover:bg-black/5"
        >
          ✕
        </button>

        {success ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">¡tu página está viva!</h2>
            <p className="text-[var(--color-ink-soft)]">
              cópiala y mándala por whatsapp:
            </p>
            <div className="rounded-lg border border-[var(--color-line)] bg-white px-4 py-3 font-mono text-sm break-all">
              {success.fullUrl}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={success.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-medium text-[var(--color-paper)]"
              >
                ver mi página →
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(success.fullUrl);
                }}
                className="rounded-full border border-[var(--color-line)] px-5 py-2 text-sm"
              >
                copiar link
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">publicar tu página</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                te creamos una cuenta para que tu página viva en internet con
                un link tuyo.
              </p>
            </div>

            <Field label="cómo te llamas (opcional)">
              <input
                type="text"
                value={state.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="tu nombre"
              />
            </Field>

            <Field label="tu email">
              <input
                type="email"
                required
                value={state.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="tucorreo@gmail.com"
              />
            </Field>

            <Field label="contraseña (mínimo 6)">
              <input
                type="password"
                required
                minLength={6}
                value={state.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </Field>

            <Field label="cuántos años tienes">
              <input
                type="number"
                required
                min={8}
                max={25}
                value={state.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="14"
              />
            </Field>

            <Field label="email de tu mamá, papá o tutor">
              <input
                type="email"
                required
                value={state.parent_email}
                onChange={(e) => update("parent_email", e.target.value)}
                placeholder="tumamá@correo.com"
              />
              <span className="block text-xs text-[var(--color-ink-soft)]">
                le mandaremos un aviso para que sepa que existes en maluwa.
              </span>
            </Field>

            <Field label="el link de tu página será maluwa.app/u/...">
              <input
                type="text"
                required
                pattern="[a-z0-9]([a-z0-9\-]{1,38}[a-z0-9])?"
                value={state.slug}
                onChange={(e) =>
                  update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                placeholder="panaderia-de-mi-mama"
              />
              <span className="block text-xs text-[var(--color-ink-soft)]">
                solo letras minúsculas, números y guiones.
              </span>
            </Field>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--color-ink-soft)]">
              <input
                type="checkbox"
                checked={state.accepted_terms}
                onChange={(e) => update("accepted_terms", e.target.checked)}
                className="mt-1"
              />
              <span>
                acepto que mi página será pública en internet y que mi mamá,
                papá o tutor recibirá un aviso. he leído la{" "}
                <a
                  href="/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-[var(--color-ink)]"
                >
                  política de privacidad
                </a>
                .
              </span>
            </label>

            {errorMsg && (
              <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !state.accepted_terms}
              className="w-full rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-deep)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "publicando..." : "publicar mi página"}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        :global(.fixed input[type="text"]),
        :global(.fixed input[type="email"]),
        :global(.fixed input[type="password"]),
        :global(.fixed input[type="number"]) {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--color-line);
          border-radius: 8px;
          background: white;
          font-size: 14px;
        }
        :global(.fixed input:focus) {
          outline: 2px solid var(--color-accent);
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-[var(--color-ink)]">
        {label}
      </span>
      {children}
    </label>
  );
}
