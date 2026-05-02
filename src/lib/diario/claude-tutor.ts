/**
 * Tutor IA real conectado a Claude Haiku 4.5.
 *
 * Reemplaza al `scripted-tutor.ts` cuando hay `ANTHROPIC_API_KEY`. La forma de
 * la salida (NewDiaryEntry[]) es idéntica para que la UI no cambie.
 *
 * Estrategia: una sola tool `respond_in_journal` con un schema discriminado
 * por `kind`. El modelo emite 1..N entradas (típicamente: opcional resource,
 * opcional snapshot, y siempre una question final). Parseamos en código y
 * descartamos lo que no encaja con NewDiaryEntry.
 *
 * Cache: el system prompt es estático y largo (>1024 tokens). Marcamos
 * cache_control para que las llamadas posteriores en la misma sesión paguen
 * solo los deltas del transcript.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  AnswerEntry,
  DiaryEntry,
  NewDiaryEntry,
  QuestionEntry,
  ResourceCard,
  ResourceEntry,
  SnapshotEntry,
} from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 2048;

const SYSTEM_PROMPT = `Eres Maluwa: un tutor-parcero que ayuda a adolescentes hispanohablantes (12-17 años, Colombia, estratos bajos) a construir su primera página web con IA.

PERSONALIDAD
- Parcero cómplice, no profesor. Cercano, con humor, sin caer en vulgaridad. Como un amigo mayor que sabe hacer plata con código y te enseña por gusto.
- Referencia de tono: Duolingo en redes — directo, juguetón, motivador.
- Hablas en español de Colombia, lowercase y casual, sin formalismo. Ejemplos: "listo", "bacano", "está chévere", "manito", "dale".
- NUNCA usas anglicismos innecesarios ("awesome", "cool", "checking", "follow up"). En su lugar: "qué bacano", "está chévere", "voy revisando", "después miramos eso".
- NUNCA llamas al estudiante por "joven", "estudiante" o "user". Es directo de tú a tú.

PROYECTO ACTUAL
El estudiante está construyendo "una página web para el negocio del barrio o de su casa" (panadería, peluquería, tienda, lo que sea). Tu trabajo es:
1. Hacer preguntas concretas y cortas para sacar la información que necesitas (nombre del negocio, qué vende, qué lo hace especial, teléfono de WhatsApp, fotos).
2. Cada cierto rato, mostrarle un "snapshot" de cómo va su página (HTML/CSS plano, mobile-first).
3. Cuando tenga sentido, ofrecer recursos: paletas de colores sugeridas, una checklist de qué pedirle al dueño del negocio, un texto de muestra.

CÓMO RESPONDER
Siempre llamas la tool \`respond_in_journal\` con una lista de entradas (\`entries\`). Cada turno debe:
- Terminar SIEMPRE con UNA \`question\` — el estudiante nunca queda sin saber qué responder.
- Opcionalmente, antes de la pregunta, incluir 0..2 entradas de tipo \`resource\` o \`snapshot\` cuando ayuden al avance del proyecto.

REGLAS DE LAS PREGUNTAS
- Una sola pregunta por turno. Concreta, no abierta. Mal: "¿cómo te imaginas la página?". Bien: "¿de qué color quieres el botón de WhatsApp?".
- Si la pregunta es ambigua para un chico de 14 años, agrega un \`hint\` corto que aclare.
- Cuando aplique, agrega 2-3 \`suggestions\` cortas (máximo 4 palabras cada una) para que pueda responder con un click.

REGLAS DE LOS RESOURCE CARDS
Tres tipos:
- \`palette\`: 3-4 colores en hex que combinen para el tipo de negocio. Tonos cálidos para gastronomía, tonos frescos para barbería/spa, etc.
- \`checklist\`: 3-5 ítems que el estudiante debe pedirle al dueño del negocio o conseguir.
- \`copy\`: un texto de muestra (gancho, descripción) que pueda copiar a su página.

REGLAS DEL SNAPSHOT
- Solo se usa cuando hay suficiente info para mostrar avance real (al menos: nombre + descripción + un dato de contacto).
- HTML mobile-first, máximo 480px de ancho. Sin frameworks, sin enlaces externos a JS.
- CSS inline en el HTML (style attrs) o en el campo \`css\` separado. Usar la paleta del estudiante o, si no la ha elegido, tonos cálidos por default (#d97757 acento, #1f1a14 texto, #faf6ef fondo).
- Tipografía system-ui, no fonts externas.
- Incluir SIEMPRE un botón "WhatsApp" si tienes el teléfono.

IMÁGENES SUBIDAS POR EL ESTUDIANTE
Cuando el estudiante adjunte una foto, te llega como un bloque \`image\` Y como texto del estilo:
  [foto_subida: https://maluwa-uploads.nyc3.digitaloceanspaces.com/journals/.../xxxxx.jpg]
Cuando generes el HTML del snapshot, **debes usar EXACTAMENTE esa URL** en \`<img src="..."\`> para que la foto aparezca en la página publicada. No inventes URLs, no uses placeholders como "foto.jpg" ni texto que diga "foto del pan". Las URLs son reales y públicas. Si recibiste varias fotos, úsalas todas en el orden adecuado.

FORMATO DEL HTML EN SNAPSHOTS
- No incluyas \`<html>\`, \`<head>\`, \`<body>\` — solo el contenido del body. La UI los envuelve.
- Sin scripts.
- El \`caption\` del snapshot es una frase corta tipo "así va, todo se puede cambiar".

REGLA DE ORO
Si dudas entre hacer una pregunta más o dar una sugerencia, haz la pregunta. El estudiante avanza preguntándole tú a él, no al revés.`;

const TOOL_SCHEMA: Anthropic.Tool = {
  name: "respond_in_journal",
  description:
    "Emitir 1..N entradas para el diario del estudiante. Debe haber siempre exactamente una entrada de tipo 'question' al final.",
  input_schema: {
    type: "object",
    properties: {
      entries: {
        type: "array",
        description: "Entradas a añadir al diario, en orden de aparición.",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            kind: {
              type: "string",
              enum: ["question", "resource", "snapshot"],
            },
            // question
            text: {
              type: "string",
              description:
                "kind=question: la pregunta. kind=resource: intro corto opcional antes de la card.",
            },
            hint: {
              type: "string",
              description: "kind=question: pista corta opcional.",
            },
            suggestions: {
              type: "array",
              items: { type: "string" },
              description:
                "kind=question: 2-3 respuestas pre-armadas que el estudiante puede tocar.",
            },
            // resource
            card_kind: {
              type: "string",
              enum: ["palette", "checklist", "copy"],
              description: "kind=resource: tipo de tarjeta.",
            },
            card_title: {
              type: "string",
              description: "kind=resource: título de la tarjeta.",
            },
            card_colors: {
              type: "array",
              items: { type: "string" },
              description: "card_kind=palette: hex colors, ej. ['#d97757'].",
            },
            card_note: {
              type: "string",
              description: "card_kind=palette: nota opcional debajo.",
            },
            card_items: {
              type: "array",
              items: { type: "string" },
              description: "card_kind=checklist: ítems del checklist.",
            },
            card_body: {
              type: "string",
              description: "card_kind=copy: el texto sugerido.",
            },
            // snapshot
            caption: {
              type: "string",
              description: "kind=snapshot: frase corta tipo 'así va por ahora'.",
            },
            html: {
              type: "string",
              description: "kind=snapshot: cuerpo HTML (sin <html>/<body>).",
            },
            css: {
              type: "string",
              description: "kind=snapshot: CSS opcional (string vacío si no).",
            },
          },
          required: ["kind"],
        },
      },
    },
    required: ["entries"],
  },
};

interface ClaudeEntry {
  kind: "question" | "resource" | "snapshot";
  text?: string;
  hint?: string;
  suggestions?: string[];
  card_kind?: "palette" | "checklist" | "copy";
  card_title?: string;
  card_colors?: string[];
  card_note?: string;
  card_items?: string[];
  card_body?: string;
  caption?: string;
  html?: string;
  css?: string;
}

type Block =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: {
        type: "url";
        url: string;
      };
    };

function entriesToMessages(
  entries: DiaryEntry[],
): Anthropic.MessageParam[] {
  // Convertimos el feed en alternancia user/assistant. La API exige
  // alternancia, así que agrupamos entries del mismo "lado". Cuando
  // una respuesta del estudiante incluye imageUrl, añadimos un bloque
  // image (Haiku 4.5 es multimodal).
  const out: Anthropic.MessageParam[] = [];
  let buffer: { role: "user" | "assistant"; blocks: Block[] } | null = null;

  const flush = () => {
    if (!buffer) return;
    // Si solo hay un bloque text, mandamos como string para conservar
    // la forma anterior. Si hay imágenes, mandamos array.
    const onlyText =
      buffer.blocks.length > 0 &&
      buffer.blocks.every((b) => b.type === "text");
    if (onlyText) {
      const text = (buffer.blocks as { type: "text"; text: string }[])
        .map((b) => b.text)
        .join("\n")
        .trim();
      out.push({ role: buffer.role, content: text });
    } else {
      out.push({
        role: buffer.role,
        content: buffer.blocks as unknown as Anthropic.ContentBlockParam[],
      });
    }
    buffer = null;
  };

  for (const e of entries) {
    if (e.kind === "answer") {
      const a = e as AnswerEntry;
      const role: "user" = "user";
      const blocks: Block[] = [];
      if (a.imageUrl) {
        blocks.push({
          type: "image",
          source: { type: "url", url: a.imageUrl },
        });
      }
      // Construimos un texto que incluya la URL literal de la foto. Eso
      // sirve para dos cosas: (1) Claude la puede transcribir tal cual al
      // <img src> del snapshot HTML, y (2) queda anclada en el contexto
      // de la conversación si más adelante quiere referenciarla.
      const textParts: string[] = [];
      if (a.imageUrl) {
        textParts.push(`[foto_subida: ${a.imageUrl}]`);
      }
      if (a.text.trim().length > 0) {
        textParts.push(a.text);
      } else if (a.imageUrl) {
        textParts.push("(adjunto una foto del negocio)");
      }
      if (textParts.length > 0) {
        blocks.push({ type: "text", text: textParts.join("\n") });
      }
      if (buffer && buffer.role === role) buffer.blocks.push(...blocks);
      else {
        flush();
        buffer = { role, blocks };
      }
    } else {
      const role: "assistant" = "assistant";
      let text = "";
      if (e.kind === "question") {
        const q = e as QuestionEntry;
        text = q.text + (q.hint ? `\n(${q.hint})` : "");
      } else if (e.kind === "resource") {
        const r = e as ResourceEntry;
        text = `[recurso: ${r.card.title}]`;
      } else if (e.kind === "snapshot") {
        const s = e as SnapshotEntry;
        text = `[mostré snapshot: ${s.caption}]`;
      }
      const block: Block = { type: "text", text };
      if (buffer && buffer.role === role) buffer.blocks.push(block);
      else {
        flush();
        buffer = { role, blocks: [block] };
      }
    }
  }
  flush();

  if (out.length === 0 || out[out.length - 1].role !== "user") {
    out.push({
      role: "user",
      content: "(el estudiante está esperando tu siguiente pregunta)",
    });
  }
  return out;
}

function claudeEntryToDiaryEntry(c: ClaudeEntry): NewDiaryEntry | null {
  if (c.kind === "question") {
    if (!c.text) return null;
    return {
      kind: "question",
      role: "ai",
      text: c.text,
      hint: c.hint,
      suggestions: c.suggestions,
    };
  }
  if (c.kind === "resource") {
    if (!c.card_kind || !c.card_title) return null;
    let card: ResourceCard | null = null;
    if (c.card_kind === "palette" && c.card_colors?.length) {
      card = {
        kind: "palette",
        title: c.card_title,
        colors: c.card_colors,
        note: c.card_note,
      };
    } else if (c.card_kind === "checklist" && c.card_items?.length) {
      card = {
        kind: "checklist",
        title: c.card_title,
        items: c.card_items,
      };
    } else if (c.card_kind === "copy" && c.card_body) {
      card = { kind: "copy", title: c.card_title, body: c.card_body };
    }
    if (!card) return null;
    return {
      kind: "resource",
      role: "ai",
      intro: c.text,
      card,
    };
  }
  if (c.kind === "snapshot") {
    if (!c.html || !c.caption) return null;
    return {
      kind: "snapshot",
      role: "ai",
      caption: c.caption,
      html: c.html,
      css: c.css ?? "",
    };
  }
  return null;
}

export interface ClaudeTurnResult {
  newEntries: NewDiaryEntry[];
  usage: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
  };
}

export async function getNextTurnFromClaude({
  entries,
}: {
  entries: DiaryEntry[];
}): Promise<ClaudeTurnResult> {
  const messages = entriesToMessages(entries);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [TOOL_SCHEMA],
    tool_choice: { type: "tool", name: "respond_in_journal" },
    messages,
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) {
    throw new Error("Claude no llamó la tool respond_in_journal");
  }

  const input = toolUse.input as { entries: ClaudeEntry[] };
  const parsed: NewDiaryEntry[] = [];
  for (const e of input.entries ?? []) {
    const converted = claudeEntryToDiaryEntry(e);
    if (converted) parsed.push(converted);
  }

  // Defensa: garantizar que siempre haya al menos una question.
  const hasQuestion = parsed.some((e) => e.kind === "question");
  if (!hasQuestion) {
    parsed.push({
      kind: "question",
      role: "ai",
      text: "te leo. ¿qué más le contamos a tu página?",
    });
  }

  return {
    newEntries: parsed,
    usage: {
      model: MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
    },
  };
}

export function getOpeningEntries(): NewDiaryEntry[] {
  return [
    {
      kind: "question",
      role: "ai",
      text: "hola. ¿qué quieres construir hoy? una página para el negocio de alguien de tu casa, del barrio.",
      hint: "sin formalismo. escríbelo como se lo contarías a un amigo.",
      suggestions: [
        "la panadería de mi mamá",
        "la peluquería de mi tía",
        "la tienda del barrio",
      ],
    },
  ];
}
