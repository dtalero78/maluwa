import Link from "next/link";

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
      >
        ← volver
      </Link>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">
        ¿qué es maluwa?
      </h1>
      <div className="mt-6 space-y-5 text-lg text-[var(--color-ink-soft)] leading-relaxed">
        <p>
          Maluwa es un proyecto sin ánimo de lucro hecho desde Colombia para
          adolescentes hispanohablantes. La idea es simple: que aprendas a
          construir cosas en internet usando IA, y que sientas que con eso
          puedes ayudar a tu familia o a tu barrio — y de paso, ganarte algo.
        </p>
        <p>
          No es un curso. No hay tareas, no hay calificaciones, no hay profe.
          Es un diario donde le cuentas a una IA qué quieres construir, ella
          te va preguntando lo que necesita saber, te da ideas, y entre los dos
          arman tu página. Cuando esté lista, la publicas y la compartes por
          WhatsApp.
        </p>
        <p>
          Es gratis y siempre va a serlo. El código es abierto.
        </p>
      </div>
      <div className="mt-10">
        <Link
          href="/diario/demo"
          className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-[var(--color-paper)] transition hover:opacity-90"
        >
          probar el diario
        </Link>
      </div>
    </main>
  );
}
