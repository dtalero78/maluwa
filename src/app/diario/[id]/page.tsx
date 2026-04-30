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

  const initial = await loadInitialEntries();
  return <Diary initialEntries={initial} />;
}

/**
 * Hidrata la conversación del estudiante desde Postgres si tiene cookie de
 * sesión con un journal existente. Si no, devuelve la apertura.
 *
 * El primer POST a /api/diario/turno se encarga de setear la cookie y
 * crear la fila en DB; este server component solo LEE.
 */
async function loadInitialEntries(): Promise<DiaryEntry[]> {
  const anonToken = (await cookies()).get("maluwa_session")?.value;

  if (anonToken) {
    try {
      const r = await query<{ entries_json: DiaryEntry[] }>(
        `SELECT entries_json FROM journals
         WHERE anon_token = $1 AND status = 'draft'
         ORDER BY updated_at DESC LIMIT 1`,
        [anonToken],
      );
      const persisted = r.rows[0]?.entries_json;
      if (Array.isArray(persisted) && persisted.length > 0) {
        return persisted;
      }
    } catch (err) {
      console.error("[diario page] hydration failed, falling back:", err);
    }
  }

  return stampOpening();
}

function stampOpening(): DiaryEntry[] {
  const now = Date.now();
  return getOpeningEntries().map((e, i) => ({
    ...e,
    id: `seed-${now}-${i}`,
    createdAt: new Date(now + i).toISOString(),
  })) as DiaryEntry[];
}
