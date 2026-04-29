/**
 * Tutor IA stubeado para el MVP del diario.
 *
 * Esta función simula a Claude Haiku/Sonnet conduciendo el proyecto
 * "página para el negocio de tu casa". Devuelve la próxima tanda de entradas
 * (pregunta + opcional resource + opcional snapshot) según el estado actual
 * del feed.
 *
 * Cuando se conecte la API real, este archivo se reemplaza por un cliente del
 * SDK de Anthropic. La forma de la respuesta se mantiene idéntica para que la
 * UI no cambie.
 */

import type { DiaryEntry, NewDiaryEntry, ResourceCard } from "./types";

interface NextTurnInput {
  entries: DiaryEntry[];
}

interface NextTurnOutput {
  newEntries: NewDiaryEntry[];
}

const STUDENT_TURN_COUNT = (entries: DiaryEntry[]) =>
  entries.filter((e) => e.kind === "answer").length;

const LATEST_ANSWER = (entries: DiaryEntry[]) =>
  [...entries].reverse().find((e): e is Extract<DiaryEntry, { kind: "answer" }> =>
    e.kind === "answer",
  );

export function getNextTurn({ entries }: NextTurnInput): NextTurnOutput {
  const turn = STUDENT_TURN_COUNT(entries);
  const latest = LATEST_ANSWER(entries)?.text ?? "";

  // Turno 0: el estudiante acaba de responder a "¿qué quieres construir?"
  // → Profundizamos sobre el negocio.
  if (turn === 1) {
    return {
      newEntries: [
        {
          kind: "resource",
          role: "ai",
          intro: "Anotado, eso suena bueno. Mira, te dejo esto por aquí:",
          card: {
            kind: "checklist",
            title: "Tres cosas que voy a necesitar de ti",
            items: [
              "El nombre del negocio",
              "Qué vende o qué hace",
              "Un teléfono de WhatsApp para que los clientes escriban",
            ],
          },
        },
        {
          kind: "question",
          role: "ai",
          text: `Empecemos por lo más básico. ¿Cómo se llama el negocio?`,
          hint: "Si no tiene nombre todavía, ponle uno tú — siempre se puede cambiar.",
        },
      ],
    };
  }

  // Turno 1 (segunda respuesta): el estudiante dio el nombre.
  if (turn === 2) {
    const nombre = latest || "tu negocio";
    return {
      newEntries: [
        {
          kind: "question",
          role: "ai",
          text: `${nombre}. Me gusta. Ahora cuéntame: ¿qué hace que la gente vuelva? ¿Qué tiene que los demás no?`,
          hint:
            "Una o dos frases. Esto es lo que vamos a poner como gancho en la página.",
          suggestions: [
            "Lo casero, hecho a mano",
            "Atención personalizada",
            "Buen precio",
          ],
        },
      ],
    };
  }

  // Turno 2: el estudiante ya describió el diferencial.
  // Mostramos primer snapshot y proponemos paleta.
  if (turn === 3) {
    const palette: ResourceCard = {
      kind: "palette",
      title: "Tres paletas que pegan con un negocio así",
      colors: ["#d97757", "#1f1a14", "#faf6ef"],
      note: "Tonos cálidos, fáciles de leer en el celular.",
    };
    const snapshotHtml = `
      <main style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #1f1a14;">
        <header style="margin-bottom: 28px;">
          <h1 style="font-size: 32px; margin: 0 0 8px; line-height: 1.1;">${escapeHtml(LATEST_ANSWER(entries.slice(0, -1))?.text ?? "Tu negocio")}</h1>
          <p style="margin: 0; color: #4a4036; font-size: 16px;">${escapeHtml(latest)}</p>
        </header>
        <a style="display: inline-block; background: #d97757; color: #faf6ef; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 15px;" href="#">
          Escríbenos por WhatsApp
        </a>
      </main>`;
    return {
      newEntries: [
        {
          kind: "resource",
          role: "ai",
          intro: "Listo, con eso ya puedo armar una primera versión.",
          card: palette,
        },
        {
          kind: "snapshot",
          role: "ai",
          caption: "Así se está viendo. Es una primera vuelta — nada está fijo.",
          html: snapshotHtml,
          css: "",
        },
        {
          kind: "question",
          role: "ai",
          text: "¿Qué cambiarías de lo que ves? Puede ser texto, color, lo que sea.",
          suggestions: [
            "Cambiar el color",
            "Hacer el título más grande",
            "Está bien así",
          ],
        },
      ],
    };
  }

  // De aquí en adelante, el script termina y la IA empieza a "improvisar".
  // En el MVP real esto es donde entra Claude. Mientras tanto, devolvemos una
  // pregunta genérica de cierre.
  return {
    newEntries: [
      {
        kind: "question",
        role: "ai",
        text: "Te leo. ¿Qué más le falta a tu página para que ya esté lista para mostrarla?",
        hint: "Puedes decirme 'ya está' y la publicamos.",
      },
    ],
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getOpeningEntries(): NewDiaryEntry[] {
  return [
    {
      kind: "question",
      role: "ai",
      text: "Hola. Cuéntame, ¿qué quieres construir hoy? ¿Una página para el negocio de alguien de tu casa, del barrio?",
      hint:
        "Sin formalismo. Escríbelo como se lo contarías a un amigo.",
      suggestions: [
        "La panadería de mi mamá",
        "La peluquería de mi tía",
        "La tienda del barrio",
      ],
    },
  ];
}
