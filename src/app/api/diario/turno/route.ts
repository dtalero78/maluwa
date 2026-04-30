import { NextResponse } from "next/server";
import { getNextTurnFromClaude } from "@/lib/diario/claude-tutor";
import { getNextTurn as getScriptedTurn } from "@/lib/diario/scripted-tutor";
import {
  getOrCreateJournalByAnonToken,
  recordAiUsage,
  updateJournalEntries,
} from "@/lib/db/journals";
import { getOrCreateAnonToken } from "@/lib/diario/session";
import type { DiaryEntry } from "@/lib/diario/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { entries?: DiaryEntry[] };
  const clientEntries = body.entries ?? [];

  const { token: anonToken } = await getOrCreateAnonToken();

  // Resolvemos el journal en DB asociado a esta sesión. Es best-effort:
  // si DB falla por la razón que sea, la conversación sigue funcionando.
  let journalId: string | null = null;
  try {
    const journal = await getOrCreateJournalByAnonToken(
      anonToken,
      clientEntries,
    );
    journalId = journal.id;
  } catch (err) {
    console.error("[diario] DB lookup failed:", err);
  }

  // Llamada al tutor (Claude o script).
  let newEntries;
  let usage = null as
    | null
    | {
        model: string;
        inputTokens: number;
        outputTokens: number;
        cacheReadTokens: number;
        cacheWriteTokens: number;
      };

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const result = await getNextTurnFromClaude({ entries: clientEntries });
      newEntries = result.newEntries;
      usage = result.usage;
    } catch (err) {
      console.error("[diario] Claude failed, falling back to scripted:", err);
      newEntries = getScriptedTurn({ entries: clientEntries }).newEntries;
    }
  } else {
    newEntries = getScriptedTurn({ entries: clientEntries }).newEntries;
  }

  const now = Date.now();
  const stamped: DiaryEntry[] = newEntries.map((e, i) => ({
    ...e,
    id: `${now}-${i}`,
    createdAt: new Date(now + i).toISOString(),
  })) as DiaryEntry[];

  // Persistencia: guardamos el feed completo (entries antiguas del cliente
  // + las nuevas de la IA). Si la cookie es nueva, esto crea un nuevo
  // journal asociado al anon_token.
  if (journalId) {
    try {
      const fullFeed = [...clientEntries, ...stamped];
      await updateJournalEntries(journalId, fullFeed);
      if (usage) {
        await recordAiUsage({ journalId, ...usage });
      }
    } catch (err) {
      console.error("[diario] DB persist failed:", err);
    }
  }

  return NextResponse.json({ entries: stamped });
}
