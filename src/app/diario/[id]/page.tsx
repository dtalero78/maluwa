import { cookies } from "next/headers";
import { Diary } from "@/components/diario/Diary";
import { getOpeningEntries } from "@/lib/diario/claude-tutor";
import { query } from "@/lib/db";
import type { DiaryEntry } from "@/lib/diario/types";

// La página depende de la cookie del request: SSR dinámico, sin caché.
export const dynamic = "force-dynamic";

export default async function DiaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params; // En v0 todos los diarios resuelven al journal del session token.

  const { entries, publishedUrl } = await loadJournalState();
  return <Diary initialEntries={entries} publishedUrl={publishedUrl} />;
}

/**
 * Hidrata la conversación del estudiante desde Postgres si tiene cookie
 * de sesión con un journal existente. También devuelve published_url si
 * el journal ya está claimado, para que la UI sepa que el botón
 * "publicar" debe convertirse en "actualizar mi página".
 */
async function loadJournalState(): Promise<{
  entries: DiaryEntry[];
  publishedUrl: string | null;
}> {
  const anonToken = (await cookies()).get("maluwa_session")?.value;

  if (anonToken) {
    try {
      const r = await query<{
        entries_json: DiaryEntry[];
        published_url: string | null;
      }>(
        `SELECT entries_json, published_url FROM journals
         WHERE anon_token = $1
         ORDER BY updated_at DESC LIMIT 1`,
        [anonToken],
      );
      const row = r.rows[0];
      const persisted = row?.entries_json;
      if (Array.isArray(persisted) && persisted.length > 0) {
        return {
          entries: persisted,
          publishedUrl: row?.published_url ?? null,
        };
      }
    } catch (err) {
      console.error("[diario page] hydration failed, falling back:", err);
    }
  }

  return { entries: stampOpening(), publishedUrl: null };
}

function stampOpening(): DiaryEntry[] {
  const now = Date.now();
  return getOpeningEntries().map((e, i) => ({
    ...e,
    id: `seed-${now}-${i}`,
    createdAt: new Date(now + i).toISOString(),
  })) as DiaryEntry[];
}
