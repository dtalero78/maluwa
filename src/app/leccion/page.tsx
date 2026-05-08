/**
 * /leccion — lección única del tronco común (MVP §2.2).
 *
 * Server component:
 *  - Lee `?j=<journalId>` (Next 16: searchParams es Promise).
 *  - Si la cookie `maluwa_lesson_seen` ya existe Y hay `j` válido,
 *    redirige server-side a `/diario/<j>` para no mostrar la lección
 *    de nuevo (sin flash).
 *  - En otro caso monta el shell visual (cream + ink, header con logo)
 *    y delega al componente cliente `<Leccion />`.
 *
 * NO es un guard del diario: alguien que entra directo a `/diario/<id>`
 * con cookie de sesión nunca pasa por acá.
 */

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Leccion } from "@/components/leccion/Leccion";
import { hasSeenLesson } from "@/lib/diario/lesson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeccionPage({
  searchParams,
}: {
  searchParams: Promise<{ j?: string }>;
}) {
  const sp = await searchParams;
  const rawJ = typeof sp?.j === "string" ? sp.j.trim() : "";
  const journalId = rawJ.length > 0 ? rawJ : null;

  // Si ya vio la lección y trae journalId, lo mandamos directo al diario.
  if (journalId && (await hasSeenLesson())) {
    redirect(`/diario/${journalId}`);
  }

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
        <span
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "#897c66",
            textTransform: "lowercase",
          }}
        >
          lección 1 / 1
        </span>
      </header>

      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 96px" }}>
        <Leccion journalId={journalId} />
      </section>
    </main>
  );
}
