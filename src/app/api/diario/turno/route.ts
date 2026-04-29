import { NextResponse } from "next/server";
import { getNextTurnFromClaude } from "@/lib/diario/claude-tutor";
import { getNextTurn as getScriptedTurn } from "@/lib/diario/scripted-tutor";
import type { DiaryEntry, NewDiaryEntry } from "@/lib/diario/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { entries?: DiaryEntry[] };
  const entries = body.entries ?? [];

  let newEntries: NewDiaryEntry[];

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      newEntries = await getNextTurnFromClaude({ entries });
    } catch (err) {
      console.error("[diario] Claude failed, falling back to scripted:", err);
      newEntries = getScriptedTurn({ entries }).newEntries;
    }
  } else {
    newEntries = getScriptedTurn({ entries }).newEntries;
  }

  const now = Date.now();
  const stamped: DiaryEntry[] = newEntries.map((e, i) => ({
    ...e,
    id: `${now}-${i}`,
    createdAt: new Date(now + i).toISOString(),
  })) as DiaryEntry[];

  return NextResponse.json({ entries: stamped });
}
