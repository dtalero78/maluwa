import { Diary } from "@/components/diario/Diary";
import { getOpeningEntries } from "@/lib/diario/scripted-tutor";
import type { DiaryEntry } from "@/lib/diario/types";

export default async function DiaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params; // En v1 todos los diarios son demo; en v2 se carga de DB.

  const now = Date.now();
  const initial: DiaryEntry[] = getOpeningEntries().map((e, i) => ({
    ...e,
    id: `seed-${i}`,
    createdAt: new Date(now + i).toISOString(),
  })) as DiaryEntry[];

  return <Diary initialEntries={initial} />;
}
