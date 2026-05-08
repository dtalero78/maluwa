/**
 * Aviso al padre/madre/tutor cuando el chico se INSCRIBE en Maluwa
 * (paso onboarding `/empezar`, antes de publicar nada).
 *
 * Cumple Ley 1581 colombiana: informar al representante legal del menor
 * antes de procesar sus datos. El padre todavía no aprueba activamente
 * (no hay link de aprobación) — solo se le notifica.
 *
 * Best-effort: si Resend falla o falta API key, no se rompe el onboarding
 * (mismo patrón que `notify-parent.ts`).
 */

import { Resend } from "resend";

const FROM_EMAIL = process.env.MALUWA_FROM_EMAIL ?? "noreply@maluwa.app";

export interface NotifyEnrollmentInput {
  parentEmail: string;
  parentName: string | null;
  studentName: string;
  studentAge: number;
  studentCity: string;
  studentSchool: string | null;
  studentEmail: string | null;
}

export interface NotifyResult {
  ok: boolean;
  providerId?: string;
  reason?: string;
  subject: string;
}

export async function notifyParentEnrollment(
  input: NotifyEnrollmentInput,
): Promise<NotifyResult> {
  const subject = `${input.studentName} se inscribió en Maluwa`;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[notify-parent-enrollment] RESEND_API_KEY no está configurada — saltando email",
    );
    return { ok: false, reason: "no api key", subject };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: `Maluwa <${FROM_EMAIL}>`,
      to: input.parentEmail,
      subject,
      html: buildHtml(input),
      text: buildText(input),
      replyTo: "hola@maluwa.app",
    });
    if (error) {
      console.error("[notify-parent-enrollment] Resend error:", error);
      return { ok: false, reason: error.message, subject };
    }
    console.log("[notify-parent-enrollment] sent:", data?.id);
    return { ok: true, providerId: data?.id, subject };
  } catch (err) {
    console.error("[notify-parent-enrollment] threw:", err);
    return { ok: false, reason: "exception", subject };
  }
}

function greeting(parentName: string | null): string {
  return parentName ? `Hola ${parentName},` : "Hola,";
}

function buildText(i: NotifyEnrollmentInput): string {
  const lines: string[] = [];
  lines.push(greeting(i.parentName));
  lines.push("");
  lines.push(
    `${i.studentName} se inscribió hoy en Maluwa, una plataforma sin ánimo de lucro hecha en Colombia donde adolescentes de 12 a 17 años aprenden a crear páginas web, bots y juegos con inteligencia artificial.`,
  );
  lines.push("");
  lines.push(
    `Aún no ha publicado nada. Si llega a publicar una página, recibirás un correo aparte con el link.`,
  );
  lines.push("");
  lines.push(`Lo que ${i.studentName} nos contó al inscribirse:`);
  lines.push(`- Edad: ${i.studentAge} años`);
  lines.push(`- Ciudad: ${i.studentCity}`);
  if (i.studentSchool) lines.push(`- Colegio: ${i.studentSchool}`);
  if (i.studentEmail) lines.push(`- Email del estudiante: ${i.studentEmail}`);
  lines.push("");
  lines.push("Algunas cosas que te conviene saber:");
  lines.push("- Maluwa es gratis. No vendemos nada, no cobramos nada.");
  lines.push("- Es código abierto: cualquiera puede revisarlo en GitHub.");
  lines.push(
    "- Si quieres que cerremos la cuenta o borremos los datos de tu hijo/a, responde este correo y lo hacemos.",
  );
  lines.push(
    "- Política de privacidad: https://maluwa.app/privacidad",
  );
  lines.push("");
  lines.push("Si tienes preguntas, responde este correo o escríbenos a hola@maluwa.app.");
  lines.push("");
  lines.push("Un abrazo,");
  lines.push("El equipo de Maluwa");
  lines.push("maluwa.app");
  return lines.join("\n");
}

function buildHtml(i: NotifyEnrollmentInput): string {
  const dataItems: string[] = [];
  dataItems.push(`<li>Edad: <strong>${escapeHtml(String(i.studentAge))}</strong> años</li>`);
  dataItems.push(`<li>Ciudad: <strong>${escapeHtml(i.studentCity)}</strong></li>`);
  if (i.studentSchool) {
    dataItems.push(`<li>Colegio: <strong>${escapeHtml(i.studentSchool)}</strong></li>`);
  }
  if (i.studentEmail) {
    dataItems.push(
      `<li>Email del estudiante: <code style="background: #f4ecdc; padding: 2px 6px; border-radius: 4px;">${escapeHtml(
        i.studentEmail,
      )}</code></li>`,
    );
  }

  return `<!doctype html>
<html lang="es">
<body style="font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #1f1a14; line-height: 1.6;">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 28px; font-weight: 700; color: #d97757;">maluwa</span>
  </div>

  <p style="margin: 0 0 16px;">${escapeHtml(greeting(i.parentName))}</p>

  <p style="margin: 0 0 16px;">
    <strong>${escapeHtml(i.studentName)}</strong> se inscribió hoy en Maluwa, una plataforma sin ánimo de lucro hecha en Colombia donde adolescentes de 12 a 17 años aprenden a crear páginas web, bots y juegos con inteligencia artificial.
  </p>

  <p style="margin: 0 0 16px;">
    Aún <strong>no ha publicado nada</strong>. Si llega a publicar una página, recibirás un correo aparte con el link.
  </p>

  <h3 style="margin: 32px 0 8px; font-size: 16px;">Lo que ${escapeHtml(i.studentName)} nos contó</h3>
  <ul style="margin: 0 0 16px; padding-left: 20px; color: #4a4036;">
    ${dataItems.join("\n    ")}
  </ul>

  <h3 style="margin: 32px 0 8px; font-size: 16px;">Lo que te conviene saber</h3>
  <ul style="margin: 0 0 16px; padding-left: 20px; color: #4a4036;">
    <li>Maluwa es <strong>gratis</strong>. No vendemos nada, no cobramos nada.</li>
    <li>Es <strong>código abierto</strong>: cualquiera puede revisarlo en GitHub.</li>
    <li>Si quieres que cerremos la cuenta o borremos los datos de tu hijo/a, responde este correo y lo hacemos.</li>
    <li>Política de privacidad: <a href="https://maluwa.app/privacidad">maluwa.app/privacidad</a></li>
  </ul>

  <p style="margin: 24px 0 0; color: #4a4036;">Si tienes preguntas, responde este correo o escríbenos a hola@maluwa.app.</p>

  <p style="margin: 24px 0 0; color: #4a4036;">Un abrazo,<br/>El equipo de Maluwa</p>

  <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e6dec9;">
  <p style="color: #999; font-size: 12px; margin: 0;">
    Recibiste este correo porque tu hijo/a registró este email como acudiente al inscribirse en maluwa.app.
  </p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
