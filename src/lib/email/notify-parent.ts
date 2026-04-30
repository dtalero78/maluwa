/**
 * Aviso al padre/madre/tutor cuando el chico publica su página en maluwa.
 *
 * Cumple un compromiso del [MVP §2.1] (consentimiento informado para 12-13)
 * y un requisito implícito de la Ley 1581 colombiana (informar al titular
 * o representante cuando se procesa data de un menor).
 *
 * Best-effort: si falla, **no** rompemos la publicación del chico — solo
 * logueamos. La publicación es la promesa al estudiante; el email es un
 * accesorio. Si Resend está caído tres veces seguidas, eso lo veremos en
 * monitoring y agregaremos retry, no antes.
 */

import { Resend } from "resend";

const FROM_EMAIL = process.env.MALUWA_FROM_EMAIL ?? "noreply@maluwa.app";

interface NotifyParentInput {
  parentEmail: string;
  studentName: string | null;
  studentEmail: string;
  publicUrl: string;
}

export interface NotifyResult {
  ok: boolean;
  providerId?: string;
  reason?: string;
  subject: string;
}

export async function notifyParent(
  input: NotifyParentInput,
): Promise<NotifyResult> {
  const studentDisplay = input.studentName || "tu hijo/a";
  const subject = `${studentDisplay} acaba de publicar su primera página web`;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[notify-parent] RESEND_API_KEY no está configurada — saltando email",
    );
    return { ok: false, reason: "no api key", subject };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: `Maluwa <${FROM_EMAIL}>`,
      to: input.parentEmail,
      subject,
      html: buildHtml(input, studentDisplay),
      text: buildText(input, studentDisplay),
      replyTo: "hola@maluwa.app",
    });
    if (error) {
      console.error("[notify-parent] Resend error:", error);
      return { ok: false, reason: error.message, subject };
    }
    console.log("[notify-parent] sent:", data?.id);
    return { ok: true, providerId: data?.id, subject };
  } catch (err) {
    console.error("[notify-parent] threw:", err);
    return { ok: false, reason: "exception", subject };
  }
}

function buildText(i: NotifyParentInput, studentDisplay: string): string {
  return `Hola,

${studentDisplay} se acaba de inscribir en Maluwa, una plataforma sin ánimo de lucro hecha en Colombia donde adolescentes aprenden a crear páginas web con inteligencia artificial.

Y ya construyó su primera página. Acabamos de publicarla en:

  ${i.publicUrl}

Te escribimos para que sepas que existe — y para que la veas. Es una página pública, accesible para cualquiera con el link.

Algunas cosas que te conviene saber:

- Maluwa es gratis. No vendemos nada, no cobramos nada.
- La cuenta de tu hijo/a quedó registrada con el correo: ${i.studentEmail}
- Si quieres que cerremos esa cuenta, escríbenos a hola@maluwa.app y la borramos.
- Nuestra política de privacidad está en https://maluwa.app/privacidad

Si tienes preguntas, respóndenos a este correo o escríbenos a hola@maluwa.app.

Un abrazo,
El equipo de Maluwa
maluwa.app
`;
}

function buildHtml(i: NotifyParentInput, studentDisplay: string): string {
  return `<!doctype html>
<html lang="es">
<body style="font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #1f1a14; line-height: 1.6;">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 28px; font-weight: 700; color: #d97757;">maluwa</span>
  </div>

  <p style="margin: 0 0 16px;">Hola,</p>

  <p style="margin: 0 0 16px;">
    <strong>${escapeHtml(studentDisplay)}</strong> se acaba de inscribir en Maluwa, una plataforma sin ánimo de lucro hecha en Colombia donde adolescentes aprenden a crear páginas web con inteligencia artificial.
  </p>

  <p style="margin: 0 0 16px;">Y ya construyó su primera página. Acabamos de publicarla acá:</p>

  <p style="margin: 24px 0;">
    <a href="${escapeAttr(i.publicUrl)}" style="display: inline-block; background: #d97757; color: white; padding: 12px 22px; border-radius: 999px; text-decoration: none; font-weight: 600;">
      Ver la página
    </a>
  </p>

  <p style="margin: 16px 0; color: #666; font-size: 14px; word-break: break-all;">
    ${escapeHtml(i.publicUrl)}
  </p>

  <p style="margin: 24px 0 8px;">Te escribimos para que sepas que existe — y para que la veas. Es una página pública, accesible para cualquiera con el link.</p>

  <h3 style="margin: 32px 0 8px; font-size: 16px;">Lo que te conviene saber</h3>
  <ul style="margin: 0 0 16px; padding-left: 20px; color: #4a4036;">
    <li>Maluwa es <strong>gratis</strong>. No vendemos nada, no cobramos nada.</li>
    <li>La cuenta quedó registrada con el correo <code style="background: #f4ecdc; padding: 2px 6px; border-radius: 4px;">${escapeHtml(i.studentEmail)}</code></li>
    <li>Si quieres que cerremos esa cuenta, respóndenos a este correo y la borramos.</li>
    <li>Nuestra política de privacidad: <a href="https://maluwa.app/privacidad">maluwa.app/privacidad</a></li>
  </ul>

  <p style="margin: 24px 0 0; color: #4a4036;">Si tienes preguntas, respóndenos a este correo.</p>

  <p style="margin: 24px 0 0; color: #4a4036;">Un abrazo,<br/>El equipo de Maluwa</p>

  <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e6dec9;">
  <p style="color: #999; font-size: 12px; margin: 0;">
    Recibiste este correo porque tu hijo/a registró este email como tutor al crear su cuenta en maluwa.app.
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

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
