/**
 * /u/[slug] — sirve la página que un estudiante publicó.
 *
 * El HTML/CSS lo escribió Claude y lo guardamos en
 * `maluwa.published_pages`. Lo servimos dentro de un iframe sandbox
 * para que cualquier JS o petición de red de ese HTML quede aislado
 * de la app principal (defensa en profundidad — Claude no debería
 * generar JS, pero no confiamos al 100%).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedPageBySlug } from "@/lib/db/users";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: "página no encontrada · maluwa" };
  return {
    title: `${page.title ?? slug} · hecho con maluwa`,
    description: `página creada por un estudiante en maluwa.app`,
  };
}

export default async function PublishedPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  const doc = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${escapeStyleTag(page.css)}</style>
</head>
<body>${page.html}</body>
</html>`;

  return (
    <main className="min-h-screen w-full">
      <iframe
        srcDoc={doc}
        sandbox=""
        className="block min-h-screen w-full border-0"
        title={page.title ?? slug}
      />
      {/* Footer "Hecho con Maluwa" — discreto, fixed abajo */}
      <Link
        href="/"
        className="fixed right-3 bottom-3 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-xs text-[var(--color-paper)] shadow-md opacity-80 transition hover:opacity-100"
      >
        hecho con maluwa
      </Link>
    </main>
  );
}

/**
 * El CSS lo metemos dentro de un <style> tag. Si el CSS contiene
 * literalmente "</style>" (raro), termina el tag y mete texto en el
 * body. Lo escapamos para evitar eso.
 */
function escapeStyleTag(css: string): string {
  return css.replace(/<\/style>/gi, "<\\/style>");
}
