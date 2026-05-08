/**
 * POST /api/onboarding/start
 *
 * Inscripción del chico en Maluwa (Ley 1581 / MVP §2.1):
 * - Captura nombre, edad, ciudad, colegio, email/nombre del acudiente.
 * - Marca consentimiento (`consented_at`, `consent_version='v1'`).
 * - Garantiza la cookie httpOnly `maluwa_session` (anon_token).
 * - Si el chico ya tiene un journal con esa cookie, lo enriquece con
 *   los datos del onboarding (idempotente). Si no, crea uno con
 *   `entries_json='[]'` — la página `/diario/[id]` stampa el opening
 *   del tutor cuando ve entries vacío.
 * - Si el chico dio email del acudiente, dispara aviso por email
 *   (best-effort) y registra la notificación en `maluwa.notifications`.
 *
 * No crea cuenta de usuario — sigue siendo flujo anónimo hasta publicar.
 */

import { NextResponse } from "next/server";
import { getOrCreateAnonToken } from "@/lib/diario/session";
import { saveOnboardingForAnonToken } from "@/lib/db/journals";
import { recordNotification } from "@/lib/db/users";
import { notifyParentEnrollment } from "@/lib/email/notify-parent-enrollment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface OnboardingBody {
  student_name?: unknown;
  student_age?: unknown;
  student_city?: unknown;
  student_school?: unknown;
  parent_email?: unknown;
  parent_name?: unknown;
  accept_terms?: unknown;
}

function asTrimmedString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || t.length > max) return null;
  return t;
}

function asOptionalTrimmedString(v: unknown, max: number): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  if (t.length > max) return null;
  return t;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as OnboardingBody;

  const studentName = asTrimmedString(body.student_name, 80);
  if (!studentName) return bad("contanos cómo te llamás");

  const ageRaw = body.student_age;
  const age =
    typeof ageRaw === "number"
      ? ageRaw
      : typeof ageRaw === "string"
        ? Number(ageRaw)
        : NaN;
  if (!Number.isInteger(age) || age < 8 || age > 25) {
    return bad("la edad tiene que estar entre 8 y 25");
  }

  const studentCity = asTrimmedString(body.student_city, 80);
  if (!studentCity) return bad("contanos en qué ciudad estás");

  const studentSchool = asOptionalTrimmedString(body.student_school, 120);

  const parentEmailRaw = asOptionalTrimmedString(body.parent_email, 120);
  const parentEmail = parentEmailRaw ? parentEmailRaw.toLowerCase() : null;

  if (age < 14) {
    if (!parentEmail || !EMAIL_RE.test(parentEmail)) {
      return bad(
        "para parceros menores de 14 necesitamos el email de tu acudiente",
      );
    }
  } else if (parentEmail && !EMAIL_RE.test(parentEmail)) {
    return bad("ese email del acudiente no parece válido");
  }

  const parentName = asOptionalTrimmedString(body.parent_name, 80);

  if (body.accept_terms !== true) {
    return bad("tenés que aceptar los términos para arrancar");
  }

  // Garantiza cookie httpOnly antes de tocar DB.
  const { token } = await getOrCreateAnonToken();

  let saved: { id: string; created: boolean };
  try {
    saved = await saveOnboardingForAnonToken(token, {
      studentName,
      studentAge: age,
      studentCity,
      studentSchool,
      parentEmail,
      parentName,
      consentVersion: "v1",
    });
  } catch (err) {
    console.error("[onboarding/start] saveOnboarding threw:", err);
    return bad("no pudimos guardar tus datos, probá de nuevo");
  }

  // Aviso al acudiente — best-effort, no bloquea el flujo.
  if (parentEmail) {
    try {
      const result = await notifyParentEnrollment({
        parentEmail,
        parentName,
        studentName,
        studentAge: age,
        studentCity,
        studentSchool,
        studentEmail: null, // en onboarding aún no hay cuenta
      });
      await recordNotification({
        userId: null, // todavía no hay user
        kind: "parent_enrollment_notice",
        toEmail: parentEmail,
        subject: result.subject,
        ok: result.ok,
        reason: result.reason,
        providerId: result.providerId,
      });
    } catch (err) {
      console.error("[onboarding/start] notify+record threw:", err);
    }
  }

  return NextResponse.json({ ok: true, journalId: saved.id });
}

function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}
