import { NextResponse } from "next/server";
import { getNextTurnFromClaude } from "@/lib/diario/claude-tutor";
import { getNextTurn as getScriptedTurn } from "@/lib/diario/scripted-tutor";
import {
  countTurnsLast24h,
  getOrCreateJournalByAnonToken,
  recordAiUsage,
  updateJournalEntries,
} from "@/lib/db/journals";
import { getOrCreateAnonToken } from "@/lib/diario/session";
import type { DiaryEntry, NewDiaryEntry } from "@/lib/diario/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tope diario por journal. Resuelve el riesgo #1 del MARCO (costo de IA
// descontrolado). 50 turnos = ~$0.30/día/estudiante con Haiku 4.5 incl.
// caching, o sea ~$10/mes/estudiante en el peor caso. Cuando un journal
// llega al tope, dejamos de llamar a Claude y devolvemos un mensaje
// amable hasta que la ventana de 24h se mueva.
const TURNS_PER_24H_LIMIT = 50;

const RATE_LIMIT_MESSAGE: NewDiaryEntry[] = [
  {
    kind: "question",
    role: "ai",
    text: "te leo, pero ya hablamos full por hoy 🙂 vuelve mañana y seguimos donde dejamos.",
    hint: "el ratico se nos pasó volando — esto es para que no se nos vuele también la plata de la IA.",
  },
];

export async function POST(req: Request) {
  const body = (await req.json()) as { entries?: DiaryEntry[] };
  const clientEntries = body.entries ?? [];

  const { token: anonToken } = await getOrCreateAnonToken();

  // Resolvemos el journal en DB asociado a esta sesión. Si la DB falla,
  // la conversación sigue funcionando sin persistencia ni rate limit.
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

  // Rate limit: si excede el cupo, devolvemos el mensaje sin llamar a Claude.
  if (journalId) {
    try {
      const turns = await countTurnsLast24h(journalId);
      if (turns >= TURNS_PER_24H_LIMIT) {
        const stamped = stampEntries(RATE_LIMIT_MESSAGE);
        try {
          await updateJournalEntries(journalId, [...clientEntries, ...stamped]);
        } catch (err) {
          console.error("[diario] rate-limit persist failed:", err);
        }
        return NextResponse.json({ entries: stamped, rateLimited: true });
      }
    } catch (err) {
      console.error("[diario] rate-limit check failed:", err);
    }
  }

  // Llamada al tutor (Claude o script).
  let newEntries: NewDiaryEntry[];
  let usage: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
  } | null = null;

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

  const stamped = stampEntries(newEntries);

  // Persistimos el feed completo + registramos costo. Best-effort.
  if (journalId) {
    try {
      await updateJournalEntries(journalId, [...clientEntries, ...stamped]);
      if (usage) await recordAiUsage({ journalId, ...usage });
    } catch (err) {
      console.error("[diario] DB persist failed:", err);
    }
  }

  return NextResponse.json({ entries: stamped });
}

function stampEntries(entries: NewDiaryEntry[]): DiaryEntry[] {
  const now = Date.now();
  return entries.map((e, i) => ({
    ...e,
    id: `${now}-${i}`,
    createdAt: new Date(now + i).toISOString(),
  })) as DiaryEntry[];
}
