import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUserFromCookie } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getUserFromCookie();
  if (user) redirect("/mis-proyectos");

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
          entrar
        </span>
      </header>

      <section
        className="px-5 pb-24 pt-8"
        style={{ maxWidth: 420, margin: "0 auto" }}
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
          hola de nuevo.
        </h1>
        <p
          style={{
            color: "#4a4036",
            marginBottom: 28,
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          entrá a tu cuenta para ver tus proyectos y seguir editando.
        </p>

        <LoginForm />

        <p
          className="font-mono"
          style={{
            marginTop: 28,
            fontSize: 12,
            color: "#897c66",
            textAlign: "center",
          }}
        >
          ¿no tenés cuenta?{" "}
          <Link
            href="/diario/demo"
            style={{ color: "#d97757", textDecoration: "underline" }}
          >
            empezar mi diario →
          </Link>
        </p>
      </section>
    </main>
  );
}
