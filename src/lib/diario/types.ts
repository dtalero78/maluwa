/**
 * Tipos del diario conversacional.
 * Cada elemento del feed es una "entry". La IA conduce siempre con la próxima
 * entrada de tipo `question`. El estudiante responde con `answer`. La IA puede
 * además insertar `resource` (tarjetas con sugerencias) y `snapshot` (el sitio
 * tal como va).
 */

export type EntryRole = "ai" | "student";

export type EntryKind = "question" | "answer" | "resource" | "snapshot";

export interface BaseEntry {
  id: string;
  kind: EntryKind;
  role: EntryRole;
  createdAt: string;
}

export interface QuestionEntry extends BaseEntry {
  kind: "question";
  role: "ai";
  text: string;
  hint?: string;
  suggestions?: string[];
}

export interface AnswerEntry extends BaseEntry {
  kind: "answer";
  role: "student";
  text: string;
  /** URL pública de Spaces si la respuesta incluye una imagen subida. */
  imageUrl?: string;
  imageMime?: string;
}

export type ResourceCard =
  | {
      kind: "palette";
      title: string;
      colors: string[];
      note?: string;
    }
  | {
      kind: "copy";
      title: string;
      body: string;
    }
  | {
      kind: "checklist";
      title: string;
      items: string[];
    };

export interface ResourceEntry extends BaseEntry {
  kind: "resource";
  role: "ai";
  intro?: string;
  card: ResourceCard;
}

export interface SnapshotEntry extends BaseEntry {
  kind: "snapshot";
  role: "ai";
  caption: string;
  html: string;
  css: string;
}

export type DiaryEntry =
  | QuestionEntry
  | AnswerEntry
  | ResourceEntry
  | SnapshotEntry;

export interface DiaryState {
  journalId: string;
  projectType: "negocio-barrio" | "otro";
  entries: DiaryEntry[];
}

/**
 * Versión "sin id ni timestamp" — útil para que el tutor (script o IA real)
 * proponga nuevas entradas sin preocuparse por metadata. Se distribuye sobre
 * la unión, lo que `Omit` directo no hace.
 */
export type NewDiaryEntry = DiaryEntry extends infer T
  ? T extends DiaryEntry
    ? Omit<T, "id" | "createdAt">
    : never
  : never;
