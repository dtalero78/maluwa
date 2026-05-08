"use client";

/**
 * Form multi-step para `/empezar`. Tres pasos:
 *  1. quién sos (nombre, edad, ciudad, colegio?)
 *  2. tu acudiente (email, nombre — required si edad < 14)
 *  3. el último paso (consentimiento, link a /privacidad)
 *
 * Submit envía un único POST a /api/onboarding/start. Si retorna 200,
 * navegamos a /diario/<journalId>. Si 400, mostramos el error sin
 * retroceder pasos.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = 1 | 2 | 3;

interface FormState {
  studentName: string;
  studentAge: string; // string para inputs; se valida a entero al avanzar
  studentCity: string;
  studentSchool: string;
  parentEmail: string;
  parentName: string;
  acceptTerms: boolean;
}

const INITIAL: FormState = {
  studentName: "",
  studentAge: "",
  studentCity: "",
  studentSchool: "",
  parentEmail: "",
  parentName: "",
  acceptTerms: false,
};

const COLOR_INK = "#1a1612";
const COLOR_INK_SOFT = "#4a4036";
const COLOR_INK_FAINT = "#897c66";
const COLOR_PAPER_INPUT = "#faf3df";
const COLOR_BORDER = "#d6c895";
const COLOR_CORAL = "#d97757";
const COLOR_CORAL_BG = "#f5d9c8";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.08em",
  color: COLOR_INK_FAINT,
  textTransform: "lowercase",
  marginBottom: 6,
  fontFamily:
    "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: COLOR_PAPER_INPUT,
  color: COLOR_INK,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: 6,
  padding: "12px 14px",
  fontSize: 16, // 16px evita zoom en iOS
  minHeight: 46,
  fontFamily:
    "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  outline: "none",
};

const inlineErrorStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#a3422a",
  fontSize: 12,
  fontFamily:
    "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

const globalErrorStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#a3422a",
  background: COLOR_CORAL_BG,
  border: `1px solid ${COLOR_CORAL}`,
  padding: "10px 12px",
  borderRadius: 6,
  marginBottom: 16,
  fontFamily:
    "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

function primaryBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: COLOR_INK,
    color: "#f4ecd6",
    border: `1px solid ${COLOR_INK}`,
    borderRadius: 6,
    padding: "13px 18px",
    minHeight: 46,
    fontSize: 15,
    letterSpacing: "0.04em",
    textTransform: "lowercase",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    fontFamily:
      "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  };
}

const secondaryBtnStyle: React.CSSProperties = {
  background: "transparent",
  color: COLOR_INK_SOFT,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: 6,
  padding: "13px 16px",
  minHeight: 46,
  fontSize: 14,
  letterSpacing: "0.04em",
  textTransform: "lowercase",
  cursor: "pointer",
  fontFamily:
    "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  // Errores inline por campo para feedback inmediato.
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});

  const ageNum = useMemo(() => {
    const n = Number(form.studentAge);
    return Number.isInteger(n) ? n : NaN;
  }, [form.studentAge]);

  const ageValid = Number.isInteger(ageNum) && ageNum >= 8 && ageNum <= 25;
  const parentRequired = ageValid && ageNum < 14;
  const parentEmailValid = form.parentEmail
    ? EMAIL_RE.test(form.parentEmail.trim().toLowerCase())
    : false;

  const step1Valid =
    form.studentName.trim().length >= 1 &&
    form.studentName.trim().length <= 80 &&
    ageValid &&
    form.studentCity.trim().length >= 1 &&
    form.studentCity.trim().length <= 80 &&
    (!form.studentSchool.trim() || form.studentSchool.trim().length <= 120);

  const step2Valid = parentRequired
    ? parentEmailValid
    : !form.parentEmail.trim() || parentEmailValid;

  const step3Valid = form.acceptTerms;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onChange<K extends keyof FormState>(key: K) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const v =
        e.target.type === "checkbox"
          ? (e.target.checked as unknown as FormState[K])
          : (e.target.value as unknown as FormState[K]);
      update(key, v);
    };
  }

  function markTouched(key: string) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function goNext() {
    setErrorGlobal(null);
    if (step === 1 && step1Valid) setStep(2);
    else if (step === 2 && step2Valid) setStep(3);
  }
  function goBack() {
    setErrorGlobal(null);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (!step1Valid || !step2Valid || !step3Valid) return;
    setErrorGlobal(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          student_name: form.studentName.trim(),
          student_age: ageNum,
          student_city: form.studentCity.trim(),
          student_school: form.studentSchool.trim() || undefined,
          parent_email: form.parentEmail.trim().toLowerCase() || undefined,
          parent_name: form.parentName.trim() || undefined,
          accept_terms: true,
        }),
      });
      const data: { ok?: boolean; journalId?: string; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (res.ok && data.ok && data.journalId) {
        router.push(`/diario/${data.journalId}`);
        return;
      }
      setErrorGlobal(
        data.error ?? "no pudimos terminar la inscripción. probá de nuevo.",
      );
    } catch {
      setErrorGlobal(
        "no pudimos conectar — revisá tu internet y probá de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "block" }}>
      <StepIndicator step={step} />

      {step === 1 && (
        <div>
          <h2 style={sectionTitleStyle}>quién sos</h2>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="studentName" style={labelStyle}>
              cómo te llamás
            </label>
            <input
              id="studentName"
              name="studentName"
              type="text"
              autoComplete="given-name"
              maxLength={80}
              required
              value={form.studentName}
              onChange={onChange("studentName")}
              onBlur={() => markTouched("studentName")}
              style={inputStyle}
              disabled={submitting}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="studentAge" style={labelStyle}>
              edad
            </label>
            <input
              id="studentAge"
              name="studentAge"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              required
              value={form.studentAge}
              onChange={(e) =>
                update(
                  "studentAge",
                  e.target.value.replace(/[^0-9]/g, "").slice(0, 2),
                )
              }
              onBlur={() => markTouched("studentAge")}
              style={inputStyle}
              disabled={submitting}
            />
            {touched.studentAge && form.studentAge && !ageValid && (
              <div style={inlineErrorStyle}>
                la edad tiene que estar entre 8 y 25.
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="studentCity" style={labelStyle}>
              ciudad
            </label>
            <input
              id="studentCity"
              name="studentCity"
              type="text"
              autoComplete="address-level2"
              maxLength={80}
              required
              value={form.studentCity}
              onChange={onChange("studentCity")}
              onBlur={() => markTouched("studentCity")}
              style={inputStyle}
              disabled={submitting}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="studentSchool" style={labelStyle}>
              colegio (opcional)
            </label>
            <input
              id="studentSchool"
              name="studentSchool"
              type="text"
              maxLength={120}
              value={form.studentSchool}
              onChange={onChange("studentSchool")}
              style={inputStyle}
              disabled={submitting}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={goNext}
              disabled={submitting || !step1Valid}
              style={primaryBtnStyle(submitting || !step1Valid)}
            >
              siguiente →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={sectionTitleStyle}>tu acudiente</h2>
          <p
            style={{
              color: COLOR_INK_SOFT,
              fontSize: 15,
              lineHeight: 1.5,
              marginBottom: 18,
            }}
          >
            {parentRequired
              ? "para registrarte necesitamos el email de tu papá, mamá o acudiente. le vamos a enviar un correo contándole."
              : "si querés (opcional), dejános el email de un acudiente. le enviamos un correo contándole que te inscribiste."}
          </p>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="parentEmail" style={labelStyle}>
              email del acudiente {parentRequired ? "" : "(opcional)"}
            </label>
            <input
              id="parentEmail"
              name="parentEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={120}
              required={parentRequired}
              value={form.parentEmail}
              onChange={onChange("parentEmail")}
              onBlur={() => markTouched("parentEmail")}
              style={inputStyle}
              disabled={submitting}
            />
            {touched.parentEmail &&
              form.parentEmail &&
              !parentEmailValid && (
                <div style={inlineErrorStyle}>
                  ese email no parece válido.
                </div>
              )}
            {touched.parentEmail && parentRequired && !form.parentEmail && (
              <div style={inlineErrorStyle}>
                como tenés menos de 14 necesitamos este email.
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="parentName" style={labelStyle}>
              nombre del acudiente (opcional)
            </label>
            <input
              id="parentName"
              name="parentName"
              type="text"
              maxLength={80}
              value={form.parentName}
              onChange={onChange("parentName")}
              style={inputStyle}
              disabled={submitting}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              style={secondaryBtnStyle}
            >
              ← atrás
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={submitting || !step2Valid}
              style={primaryBtnStyle(submitting || !step2Valid)}
            >
              siguiente →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={sectionTitleStyle}>el último paso</h2>

          {errorGlobal && (
            <div role="alert" style={globalErrorStyle}>
              {errorGlobal}
            </div>
          )}

          <div
            style={{
              border: `1px solid ${COLOR_BORDER}`,
              background: COLOR_PAPER_INPUT,
              borderRadius: 6,
              padding: "14px 16px",
              marginBottom: 18,
              fontSize: 15,
              lineHeight: 1.55,
              color: COLOR_INK_SOFT,
            }}
          >
            <p style={{ margin: "0 0 10px" }}>
              acá lo que es bueno que sepás antes de arrancar:
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li style={{ marginBottom: 6 }}>
                vamos a usar IA (claude, de anthropic — eeuu) para crear
                cosas con vos.
              </li>
              <li style={{ marginBottom: 6 }}>
                tus datos viven en servidores de anthropic y digitalocean.
              </li>
              <li style={{ marginBottom: 6 }}>
                {form.parentEmail.trim()
                  ? "tu acudiente va a recibir un email avisándole que arrancaste."
                  : "no diste email del acudiente, así que no le mandamos nada."}
              </li>
              {parentRequired && (
                <li>
                  como tenés menos de 14, tu acudiente debe estar de acuerdo
                  con que uses maluwa.
                </li>
              )}
            </ul>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: 15,
              lineHeight: 1.5,
              color: COLOR_INK,
              marginBottom: 24,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={onChange("acceptTerms")}
              disabled={submitting}
              style={{
                marginTop: 4,
                width: 18,
                height: 18,
                accentColor: COLOR_CORAL,
                flexShrink: 0,
              }}
            />
            <span>
              acepto la{" "}
              <Link
                href="/privacidad"
                target="_blank"
                style={{
                  color: COLOR_CORAL,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                política de privacidad
              </Link>{" "}
              y entiendo cómo maluwa va a usar mis datos.
            </span>
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              style={secondaryBtnStyle}
            >
              ← atrás
            </button>
            <button
              type="submit"
              disabled={submitting || !step3Valid}
              style={primaryBtnStyle(submitting || !step3Valid)}
            >
              {submitting ? "arrancando…" : "arrancá →"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 22,
  lineHeight: 1.2,
  letterSpacing: "-0.015em",
  fontWeight: 500,
  marginBottom: 16,
  color: COLOR_INK,
};

function StepIndicator({ step }: { step: Step }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 22,
        fontFamily:
          "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        letterSpacing: "0.08em",
        color: COLOR_INK_FAINT,
        textTransform: "lowercase",
      }}
    >
      <span>paso {step} / 3</span>
      <span style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            style={{
              width: 18,
              height: 4,
              borderRadius: 2,
              background: n <= step ? COLOR_CORAL : COLOR_BORDER,
            }}
          />
        ))}
      </span>
    </div>
  );
}
