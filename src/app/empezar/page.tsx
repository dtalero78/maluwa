/**
 * /empezar — onboarding (Ley 1581 / MVP §2.1).
 *
 * Server component mínimo: monta el shell visual del diario (cream + ink)
 * y delega el form multi-step al componente cliente.
 */

import Image from "next/image";
import Link from "next/link";
import { OnboardingForm } from "@/components/empezar/OnboardingForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function EmpezarPage() {
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
          inscripción
        </span>
      </header>

      <section
        className="px-5 pb-24 pt-4"
        style={{ maxWidth: 480, margin: "0 auto" }}
      >
        <h1
          style={{
            fontSize: 34,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          arranquemos.
        </h1>
        <p
          style={{
            color: "#4a4036",
            marginBottom: 24,
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          tres preguntas chiquitas y entrás al diario. después no te jode más.
        </p>

        <OnboardingForm />
      </section>
    </main>
  );
}
