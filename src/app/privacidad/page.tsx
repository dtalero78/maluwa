import Link from "next/link";

export const metadata = {
  title: "política de privacidad · maluwa",
  description:
    "Cómo Maluwa trata los datos personales de los estudiantes y de sus padres o tutores.",
};

const VIGENTE_DESDE = "30 de abril de 2026";

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed">
      <Link
        href="/"
        className="text-sm text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
      >
        ← volver
      </Link>

      <h1 className="mt-8 text-4xl font-semibold tracking-tight">
        política de privacidad
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        Vigente desde el {VIGENTE_DESDE}.
      </p>

      <p className="mt-8 text-lg text-[var(--color-ink-soft)]">
        Esta página explica, en lenguaje sencillo, qué datos guarda Maluwa,
        para qué los usa y cómo puedes pedirnos que los borremos. Está
        pensada para que un papá, una mamá o un tutor pueda leerla en cinco
        minutos sin formación legal.
      </p>

      <Section title="1. ¿Quiénes somos?">
        <p>
          Maluwa es un proyecto personal sin ánimo de lucro hecho desde
          Colombia. No somos una empresa registrada todavía: somos una
          persona, Daniel Talero, manteniendo el código y el servicio.
        </p>
        <p className="mt-3">
          Si en el futuro Maluwa se constituye como organización, esta
          política se actualizará para reflejarlo y se avisará por email a
          todas las personas con cuenta.
        </p>
      </Section>

      <Section title="2. ¿A quién va dirigido este servicio?">
        <p>
          Maluwa está dirigido a adolescentes hispanohablantes entre 12 y
          17 años. La participación es voluntaria, gratuita y siempre lo
          será. No vendemos suscripciones, no mostramos publicidad, no
          revendemos datos.
        </p>
      </Section>

      <Section title="3. ¿Qué datos guardamos?">
        <p>
          Mientras un estudiante usa Maluwa para construir su proyecto
          (antes de publicar) guardamos:
        </p>
        <ul className="mt-3 ml-6 list-disc space-y-1">
          <li>
            Una <strong>cookie en su navegador</strong> con un identificador
            anónimo. Sirve para que su conversación con la IA sobreviva a
            recargas. No tiene su nombre, ni su email, ni nada que lo
            identifique fuera de su navegador.
          </li>
          <li>
            La <strong>conversación con el tutor IA</strong> y los borradores
            de su página. Esto vive en una base de datos en DigitalOcean.
          </li>
        </ul>

        <p className="mt-4">
          Cuando el estudiante decide{" "}
          <strong>publicar su página</strong>, le pedimos:
        </p>
        <ul className="mt-3 ml-6 list-disc space-y-1">
          <li>Nombre (opcional).</li>
          <li>Email del estudiante.</li>
          <li>Una contraseña (la guardamos cifrada con bcrypt).</li>
          <li>Edad.</li>
          <li>
            <strong>Email del padre, madre o tutor</strong> — siempre, sin
            importar la edad, le mandamos un aviso para que sepa que su hijo
            existe en Maluwa.
          </li>
          <li>El "nombre" del link público (el slug).</li>
        </ul>

        <p className="mt-4">
          Adicionalmente registramos automáticamente, por cada llamada a la
          IA, cuántos tokens consumió (sin contenido) — esto sirve para
          controlar el costo del proyecto, no para perfilar al estudiante.
        </p>
      </Section>

      <Section title="4. ¿Para qué los usamos?">
        <ul className="ml-6 list-disc space-y-1">
          <li>Mantener la conversación entre el estudiante y la IA.</li>
          <li>Servir su página publicada en internet.</li>
          <li>
            Avisar al padre, madre o tutor cuando se publica una página.
          </li>
          <li>
            Auditar el costo de la IA para que el proyecto sea viable.
          </li>
        </ul>
        <p className="mt-3">
          <strong>Para nada más.</strong> No mandamos newsletters. No
          vendemos los datos. No los usamos para entrenar modelos de IA. No
          los compartimos con terceros excepto los servicios técnicos
          listados abajo.
        </p>
      </Section>

      <Section title="5. ¿Con quién compartimos los datos?">
        <p>
          Para que la app funcione, ciertos datos pasan por servicios
          externos. Es importante que lo sepas:
        </p>
        <ul className="mt-3 ml-6 list-disc space-y-2">
          <li>
            <strong>Anthropic</strong> (Estados Unidos) — recibe la
            conversación con el tutor para procesarla con Claude. Anthropic
            tiene cláusulas que prohíben usar estos datos para entrenar sus
            modelos.{" "}
            <a
              className="underline"
              href="https://www.anthropic.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Anthropic →
            </a>
          </li>
          <li>
            <strong>DigitalOcean</strong> (Estados Unidos) — almacena la
            base de datos y aloja el sitio.
          </li>
          <li>
            <strong>Resend</strong> (Estados Unidos) — manda los emails al
            padre/tutor.
          </li>
        </ul>
        <p className="mt-3">
          Porque estos servicios están en Estados Unidos, hay una{" "}
          <strong>transferencia internacional de datos</strong> (algo que la
          Ley 1581 colombiana exige informar). Estos servicios cumplen con
          estándares razonables de protección de datos.
        </p>
      </Section>

      <Section title="6. Datos de menores de edad">
        <p>
          Maluwa está pensado para adolescentes desde los 12 años. Tomamos
          tres medidas específicas para menores:
        </p>
        <ul className="mt-3 ml-6 list-disc space-y-1">
          <li>
            Antes de publicar, pedimos siempre el email del padre, madre o
            tutor para informarle.
          </li>
          <li>
            El estudiante debe aceptar explícitamente que su página será
            pública en internet.
          </li>
          <li>
            Si un padre, madre o tutor nos escribe pidiendo que borremos la
            cuenta, lo hacemos en menos de 7 días sin pedir más explicaciones.
          </li>
        </ul>
      </Section>

      <Section title="7. Tus derechos (Ley 1581 de 2012)">
        <p>
          Como titular de los datos (o como su representante en el caso de
          menores), tienes derecho a:
        </p>
        <ul className="mt-3 ml-6 list-disc space-y-1">
          <li>Saber qué datos tenemos sobre ti o tu hijo/a.</li>
          <li>Rectificar datos incorrectos.</li>
          <li>Borrar la cuenta y todos sus datos.</li>
          <li>Revocar la autorización en cualquier momento.</li>
          <li>Solicitar la copia portable de tus datos.</li>
          <li>
            Presentar quejas ante la{" "}
            <a
              className="underline"
              href="https://www.sic.gov.co"
              target="_blank"
              rel="noopener noreferrer"
            >
              Superintendencia de Industria y Comercio
            </a>{" "}
            si crees que estamos haciendo algo mal.
          </li>
        </ul>
        <p className="mt-3">
          Para ejercer cualquiera de estos derechos, escríbenos a{" "}
          <a className="underline" href="mailto:hola@maluwa.app">
            hola@maluwa.app
          </a>
          . Respondemos en menos de 7 días.
        </p>
      </Section>

      <Section title="8. ¿Cuánto tiempo guardamos los datos?">
        <ul className="ml-6 list-disc space-y-1">
          <li>
            <strong>Conversaciones de borrador</strong> (sin publicar): hasta
            que el estudiante o el tutor pidan borrarlas, o un máximo de 12
            meses sin actividad.
          </li>
          <li>
            <strong>Páginas publicadas</strong>: mientras el estudiante o el
            tutor las quieran tener vivas. Si nos escriben pidiendo bajar
            una página, la borramos en menos de 7 días.
          </li>
          <li>
            <strong>Cuentas de usuario</strong>: se eliminan junto con la
            página al primer pedido por email.
          </li>
        </ul>
      </Section>

      <Section title="9. Cookies">
        <p>Solo usamos una cookie técnica indispensable, llamada{" "}
          <code className="rounded bg-[var(--color-paper-2)] px-1.5 py-0.5 text-sm">
            maluwa_session
          </code>
          , que asocia un navegador con su conversación. No usamos cookies
          de publicidad, ni de análisis, ni de redes sociales.
        </p>
      </Section>

      <Section title="10. Cambios a esta política">
        <p>
          Si actualizamos esta política, lo notificaremos por email a todas
          las personas que tengan cuenta y publicaremos un cambio aquí con
          su fecha. La fecha de vigencia más reciente es la que aparece al
          comienzo de esta página.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p>
          Cualquier pregunta o solicitud sobre el tratamiento de tus datos:
        </p>
        <ul className="mt-3 ml-6 list-disc space-y-1">
          <li>
            Email:{" "}
            <a className="underline" href="mailto:hola@maluwa.app">
              hola@maluwa.app
            </a>
          </li>
          <li>Responsable: Daniel Talero (persona natural).</li>
        </ul>
      </Section>

      <p className="mt-12 border-t border-[var(--color-line)] pt-6 text-sm text-[var(--color-ink-soft)]">
        Esta política se inspira en la Ley 1581 de 2012 (Colombia) y busca
        ser entendible. No reemplaza una asesoría legal en caso de duda
        seria. Si encuentras algo que no se entiende o algo que está mal,
        escríbenos y lo arreglamos.
      </p>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[var(--color-ink-soft)]">
        {children}
      </div>
    </section>
  );
}
