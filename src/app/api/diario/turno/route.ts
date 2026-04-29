import { NextResponse } from "next/server";
import { getNextTurn } from "@/lib/diario/scripted-tutor";
import type { DiaryEntry } from "@/lib/diario/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { entries?: DiaryEntry[] };
  const entries = body.entries ?? [];

  const { newEntries } = getNextTurn({ entries });

  const now = Date.now();
  const stamped: DiaryEntry[] = newEntries.map((e, i) => ({
    ...e,
    id: `${now}-${i}`,
    createdAt: new Date(now + i).toISOString(),
  })) as DiaryEntry[];

  // Latencia simulada para que se sienta como una IA real "pensando".
  await new Promise((r) => setTimeout(r, 700));

  return NextResponse.json({ entries: stamped });
}
