import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUserFromCookie } from "@/lib/auth/session";
import {
  getPublishedPageByUser,
  getJournalIdByUser,
} from "@/lib/db/users";
import { LogoutButton } from "./logout-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MisProyectosPage() {
  const user = await getUserFromCookie();
  // El middleware ya redirige si no hay cookie; esto es defense in depth
  // (cookie inválida que pasó el presence-check pero no el HMAC, o user
  // borrado de la DB).
  if (!user) redirect("/login");

  const [page, journalId] = await Promise.all([
    getPublishedPageByUser(user.id),
    getJournalIdByUser(user.id),
  ]);

  const hasName = !!user.name;

  return (
    <main
      className="min-h-screen w-full"
      style={{
        background: "#f4ecd6",
        color: "#1a1612",
        fontFamily:
          "var(--font-serif-editorial), 'Source Serif 4', Georgia, serif",
      }}
    >
      <header
        className="flex items-center justify-between px-5 py-5"
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        <Link href="/" aria-label="ir al inicio" className="flex items-center">
          <Image
            src="/logo-v2.png"
            alt="maluwa"
            width={384}
            height={140}
            priority
            className="h-7 w-auto"
            style={{ filter: "brightness(0) opacity(0.7)" }}
          />
        </Link>
        <LogoutButton />
      </header>

      <section
        className="px-5 pb-24 pt-6"
        style={{ maxWidth: 640, margin: "0 auto" }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "#897c66",
            textTransform: "lowercase",
            marginBottom: 6,
          }}
        >
          mis proyectos
        </p>
        <h1
          style={{
            fontSize: 34,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontWeight: 500,
            marginBottom: 28,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {hasName ? (
            <>hola, {user.name}.</>
          ) : (
            <>
              hola.
              <span
                className="font-mono"
                style={{
                  display: "block",
                  fontSize: 13,
                  lineHeight: 1.4,
                  letterSpacing: "0.02em",
                  color: "#4a4036",
                  marginTop: 8,
                  fontWeight: 400,
                  overflowWrap: "anywhere",
                  wordBreak: "break-all",
                }}
              >
                {user.email}
              </span>
            </>
          )}
        </h1>

        {page ? (
          <ProjectCard
            slug={page.slug}
            title={page.title}
            createdAt={page.created_at}
            journalId={journalId}
          />
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

function ProjectCard({
  slug,
  title,
  createdAt,
  journalId,
}: {
  slug: string;
  title: string | null;
  createdAt: string;
  journalId: string | null;
}) {
  const formatted = formatDate(createdAt);
  const displayTitle = title?.trim() || "tu primer proyecto";
  return (
    <article
      style={{
        background: "#faf3df",
        border: "1px solid #d6c895",
        borderRadius: 10,
        padding: "22px 22px 24px",
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.08em",
          color: "#897c66",
          textTransform: "lowercase",
          marginBottom: 8,
        }}
      >
        publicado · {formatted}
      </div>
      <h2
        style={{
          fontSize: 24,
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
          fontWeight: 500,
          marginBottom: 6,
        }}
      >
        {displayTitle}
      </h2>
      <a
        href={`/u/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono"
        style={{
          fontSize: 13,
          color: "#d97757",
          textDecoration: "underline",
          wordBreak: "break-all",
        }}
      >
        /u/{slug} ↗
      </a>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {journalId ? (
          <Link
            href={`/diario/${journalId}`}
            className="font-mono"
            style={{
              background: "#1a1612",
              color: "#f4ecd6",
              border: "1px solid #1a1612",
              borderRadius: 6,
              padding: "10px 14px",
              fontSize: 13,
              letterSpacing: "0.04em",
              textTransform: "lowercase",
              textDecoration: "none",
            }}
          >
            continuar editando →
          </Link>
        ) : null}
        <a
          href={`/u/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono"
          style={{
            background: "transparent",
            color: "#4a4036",
            border: "1px solid #d6c895",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            letterSpacing: "0.04em",
            textTransform: "lowercase",
            textDecoration: "none",
          }}
        >
          ver página pública ↗
        </a>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: "#faf3df",
        border: "1px dashed #d6c895",
        borderRadius: 10,
        padding: "28px 22px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 17,
          lineHeight: 1.5,
          color: "#4a4036",
          marginBottom: 18,
        }}
      >
        todavía no has publicado tu primer proyecto.
      </p>
      <Link
        href="/diario/demo"
        className="font-mono"
        style={{
          display: "inline-block",
          background: "#1a1612",
          color: "#f4ecd6",
          border: "1px solid #1a1612",
          borderRadius: 6,
          padding: "10px 16px",
          fontSize: 13,
          letterSpacing: "0.04em",
          textTransform: "lowercase",
          textDecoration: "none",
        }}
      >
        ir al diario →
      </Link>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
