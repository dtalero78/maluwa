import Image from "next/image";
import Link from "next/link";

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="maluwa">
          <Image
            src="/logo-v2.png"
            alt="maluwa"
            width={384}
            height={140}
            priority
            className="h-16 w-auto md:h-20"
          />
        </Link>
        <Link
          href="/diario/demo"
          className="text-sm text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
        >
          entrar al diario
        </Link>
      </header>

      <section className="mt-20 flex-1">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
          gratis · open source · para pelados
        </p>
        <h1 className="mt-4 text-5xl leading-tight font-semibold tracking-tight md:text-6xl">
          construye lo que se te ocurra,
          <br />
          <span className="italic">en un diario</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--color-ink-soft)]">
          Maluwa es un diario donde le cuentas a una IA qué quieres hacer — una
          página para el negocio de tu casa, una mini-app, un bot — y la IA te
          va preguntando, dándote ideas y armando el sitio contigo. Al final lo
          publicas, lo compartes por WhatsApp, y existe en internet.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/diario/demo"
            className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-[var(--color-paper)] transition hover:opacity-90"
          >
            empezar mi diario
          </Link>
          <Link
            href="/sobre"
            className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-paper-2)]"
          >
            ¿qué es esto?
          </Link>
        </div>
      </section>

      <footer className="mt-16 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-ink-soft)]">
        proyecto sin ánimo de lucro · hecho desde Colombia ·{" "}
        <a
          href="https://github.com/danieltalero/maluwa"
          className="underline-offset-4 hover:underline"
        >
          código en GitHub
        </a>
      </footer>
    </main>
  );
}
