import Image from "next/image";
import Link from "next/link";

const BARRIOS = [
  {
    text: "valentina, 16 · ciudad bolívar — landing pa la peluquería de la mamá",
    price: "$250.000",
    sep: "" as const,
  },
  {
    text: "miguel, 14 · soacha — menú QR pal restaurante del tío",
    price: "$180.000",
    sep: "b" as const,
  },
  {
    text: "samanta, 13 · bosa — web pa la modistería de la abuela",
    price: "$150.000",
    sep: "" as const,
  },
  {
    text: "andrés, 17 · maicao — página pal taller de motos",
    price: "$400.000",
    sep: "b" as const,
  },
  {
    text: "kelly, 15 · cartagena — catálogo pa la tienda de la cuadra",
    price: "$220.000",
    sep: "" as const,
  },
  {
    text: "brayan, 12 · medellín — agenda pa la barbería del primo",
    price: "$160.000",
    sep: "b" as const,
  },
];

const JOBS = [
  {
    tag: "PANADERÍA · TIENDA",
    h: "página simple con menú y whatsapp",
    p: "foto del local, productos, precios, horario, ubicación, botón de whatsapp pa pedidos. lo más vendido.",
    price: "$150K – $250K",
    time: "~ 1 tarde",
  },
  {
    tag: "RESTAURANTE",
    h: "menú QR que el cliente escanea en la mesa",
    p: "el dueño imprime un sticker con QR. el cliente lo escanea y ve la carta sin descargar app. fotos, precios, todo.",
    price: "$180K – $350K",
    time: "~ 2 tardes",
  },
  {
    tag: "PELUQUERÍA · BARBERÍA",
    h: "catálogo de servicios + agenda por whatsapp",
    p: 'servicios, precios, fotos de cortes. botón "agendar" que abre whatsapp con el mensaje listo. los clientes lo aman.',
    price: "$200K – $400K",
    time: "~ 2 tardes",
  },
  {
    tag: "TALLER · MODISTERÍA · LAVADERO",
    h: "página de servicios con galería de trabajos",
    p: "mostrar el trabajo bien hecho (fotos antes/después), tarifas, contacto. la gente confía cuando ve el portafolio.",
    price: "$150K – $400K",
    time: "~ 1-2 tardes",
  },
];

const STEPS = [
  {
    num: "01",
    h: "vos le contás qué querés.",
    p: '"una página pa la panadería de mi mamá", "un bot que responda los mensajes de la peluquería", "un minijuego pa vender a mis amigos". en español. nada técnico.',
    time: "5 min",
  },
  {
    num: "02",
    h: "ella te hace preguntas.",
    p: "maluwa no te enseña — te pregunta. preguntas chiquitas, vos respondés, ella va armando. entre los dos sale algo real, no un dibujo.",
    time: "~ una tarde",
  },
  {
    num: "03",
    h: "lo compartís. o lo cobrás.",
    p: "cuando termina lo mandás por whatsapp. si era pa un cliente, le pasás el link y le cobrás. te damos el guión, la plantilla del precio, todo. el primer cliente puede ser tu mamá. en serio.",
    time: "esa semana",
  },
];

type FaqItem = {
  q: string;
  a: React.ReactNode;
  spotlight?: boolean;
};

const FAQS: FaqItem[] = [
  {
    q: "¿de verdad gratis o me van a cobrar después?",
    a: (
      <>
        de verdad. somos{" "}
        <strong className="bg-[var(--landing-acid)] px-1 font-semibold">
          open-source
        </strong>{" "}
        — el código está en github, lo puede ver cualquiera. no hay tarjeta, no
        hay &quot;premium&quot;, no hay trampa. nos financian fundaciones que
        quieren que haya más pelaos haciendo plata digital en colombia.
      </>
    ),
  },
  {
    q: "¿necesito saber programar?",
    spotlight: true,
    a: (
      <>
        no. la{" "}
        <strong className="bg-[var(--landing-blue)] px-1 font-semibold">
          IA escribe el código
        </strong>
        . vos pensás qué necesita el cliente y se lo pedís a la IA en español.
        eso es todo. te enseñamos a pedirlo bien.
      </>
    ),
  },
  {
    q: "¿necesito computador?",
    a: (
      <>
        celular sirve pa empezar. computador es mejor — incluso uno viejo del
        colegio o de un hermano. si no tenés ninguno escribinos por whatsapp y
        te ayudamos a conseguir uno reciclado.
      </>
    ),
  },
  {
    q: "¿cuánto me demoro en hacerme la primera plata?",
    a: (
      <>
        los primeros parceros que entraron hicieron su primera venta a las{" "}
        <strong className="bg-[var(--landing-hot)] px-1 font-semibold text-[var(--landing-paper)]">
          3 semanas
        </strong>
        . depende de qué tan rápido le mandes el whatsapp al primer cliente.
        (spoiler: tu mamá te va a decir que sí.)
      </>
    ),
  },
  {
    q: "¿y si me sale mal con el cliente?",
    a: (
      <>
        te enseñamos cómo hacerlo: trato chiquito primero, abono del 50%,
        entrega, resto. si algo se cae te ayudamos por whatsapp. no estás solo
        en esto.
      </>
    ),
  },
  {
    q: "¿esto es legal pa un menor de edad?",
    a: (
      <>
        sí. trabajo digital independiente está cubierto. solo necesitás que tu
        acudiente firme un consentimiento la primera vez (te lo pasamos
        llenecito). la plata es tuya.
      </>
    ),
  },
];

const CHAT_BUBBLES: Array<{
  side: "me" | "them";
  text: string;
  time: string;
}> = [
  { side: "me", text: "buenas don carlos, soy juan, el de la cuadra", time: "2:14 p.m." },
  { side: "me", text: "le hago la página web pa la panadería?", time: "2:14 p.m." },
  { side: "them", text: "y eso pa qué", time: "2:18 p.m." },
  {
    side: "me",
    text:
      'pa que cuando alguien busque "panadería cerca" en google le aparezca la suya y vendan más. también pa pedidos por whatsapp',
    time: "2:19 p.m.",
  },
  { side: "me", text: "se la entrego el lunes. son $200.000", time: "2:19 p.m." },
  { side: "them", text: "venga le doy 150 ya", time: "2:24 p.m." },
  { side: "me", text: "180 y trato hecho 🤝", time: "2:24 p.m." },
  { side: "them", text: "listo pues", time: "2:25 p.m." },
  { side: "them", text: "cuándo viene", time: "2:25 p.m." },
];

const FOOTER_MARQUEE = [
  { t: "open source", d: "" },
  { t: "hecho en bogotá", d: "b" },
  { t: "sin papás", d: "" },
  { t: "sin tarjeta", d: "b" },
  { t: "sin profe", d: "" },
  { t: "parceros 12-17", d: "b" },
  { t: "la primera plata es tuya", d: "" },
  { t: "open source", d: "b" },
  { t: "hecho en bogotá", d: "" },
  { t: "sin papás", d: "b" },
  { t: "sin tarjeta", d: "" },
  { t: "sin profe", d: "b" },
  { t: "parceros 12-17", d: "" },
  { t: "la primera plata es tuya", d: "b" },
];

export default function Landing() {
  const year = new Date().getFullYear();

  return (
    <div className="landing-root min-h-screen">
      {/* TOP BAR */}
      <div className="sticky top-0 z-[100] flex items-center justify-between gap-2 border-b-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-paper)] px-4 py-3 text-sm md:px-7 md:py-[18px]">
        <Link href="/" className="flex items-center" aria-label="maluwa">
          <Image
            src="/logo-v2.png"
            alt="maluwa"
            width={384}
            height={140}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="landing-topbar-nav hidden items-center gap-[22px] md:flex">
          <Link href="#cosa">cómo es la cosa</Link>
          <Link href="#jobs">qué vendés</Link>
          <Link href="#faq">preguntas</Link>
          <Link href="/sobre">sobre</Link>
        </nav>
        <div className="flex items-center gap-3 md:gap-[14px]">
          <div
            className="hidden items-center gap-2 font-mono text-[12px] opacity-85 lg:flex"
            aria-live="polite"
          >
            <span className="landing-pulse inline-block h-2 w-2 rounded-full bg-[var(--landing-hot)]" />
            <span>1.247 parceros conectados</span>
          </div>
          <Link href="/diario/demo" className="landing-btn-sm">
            arrancá →
          </Link>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav
        aria-label="navegación móvil"
        className="fixed bottom-3.5 left-3.5 right-3.5 z-[200] flex justify-between gap-1 rounded-xl border-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-ink)] p-1.5 md:hidden"
        style={{ boxShadow: "4px 4px 0 0 var(--landing-blue)" }}
      >
        <Link href="#jobs" className="landing-mob-nav-item">qué vendés</Link>
        <Link href="#cosa" className="landing-mob-nav-item">cómo</Link>
        <Link href="#faq" className="landing-mob-nav-item">preguntas</Link>
        <Link href="/diario/demo" className="landing-mob-nav-item cta">
          arrancá →
        </Link>
      </nav>

      {/* HERO */}
      <div className="border-b-[1.5px] border-[var(--landing-ink)]">
        <section className="relative mx-auto max-w-[1280px] px-[18px] pb-[130px] pt-14 md:px-7 md:pb-[70px] md:pt-20">
          {/* hero stickers */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="landing-sticker"
              style={{
                top: "8px",
                right: "10px",
                fontSize: "12px",
                padding: "5px 9px",
                transform: "rotate(5deg)",
              }}
            >
              12 a 17.<br />de colombia.
            </div>
            <div
              className="landing-sticker pink hidden md:block"
              style={{ top: "230px", right: "110px", transform: "rotate(-4deg)" }}
            >
              100% gratis.<br />en serio.
            </div>
            <div
              className="landing-sticker pink md:hidden"
              style={{
                bottom: "100px",
                right: "14px",
                fontSize: "14px",
                padding: "6px 10px",
                transform: "rotate(-5deg)",
                zIndex: 3,
              }}
            >
              100% gratis.<br />en serio.
            </div>
            <div
              className="landing-sticker blue hidden md:block"
              style={{ bottom: "60px", right: "90px", transform: "rotate(-7deg)" }}
            >
              $$$ por una<br />tarde.
            </div>
            <div
              className="landing-sticker blue md:hidden"
              style={{
                bottom: "30px",
                left: "18px",
                fontSize: "14px",
                padding: "6px 10px",
                transform: "rotate(-8deg)",
                zIndex: 3,
              }}
            >
              $$$ por una<br />tarde.
            </div>
            {/* desktop s1 (overrides mobile) */}
            <div
              className="landing-sticker absolute hidden md:block"
              style={{ top: "95px", right: "50px", transform: "rotate(6deg)" }}
            >
              12 a 17.<br />de colombia.
            </div>
          </div>

          <div className="landing-eyebrow mb-8 relative">
            <span className="arrow">›</span> open-source · hecho en colombia · sin papás
          </div>

          <h1
            className="landing-display relative mb-8 max-w-[1100px]"
            style={{
              fontSize: "clamp(40px, 11vw, 124px)",
              lineHeight: 0.9,
              letterSpacing: "-0.045em",
            }}
          >
            hacele la <span className="landing-hl">página</span>
            <br />
            a la <span className="landing-h1-scribble">panadería</span>
            <br />
            de la esquina.
          </h1>

          <p
            className="relative mb-10 max-w-[600px]"
            style={{ fontSize: "clamp(16px, 1.6vw, 22px)", lineHeight: 1.45 }}
          >
            <strong className="font-bold">
              no clases, no tareas, no profesores.
            </strong>{" "}
            solo imaginación. hacé páginas, bots de whatsapp, hasta minijuegos —
            con una IA que te va preguntando hasta que sale.{" "}
            <span className="landing-ul-blue">la primera la podés cobrar el lunes.</span>
          </p>

          <div className="relative flex flex-wrap items-center gap-4">
            <Link href="/diario/demo" className="landing-btn acid">
              arrancá ya <span className="em">→</span></Link>
            <Link
              href="#chat"
              className="text-sm opacity-70 underline-offset-2 hover:underline"
            >
              ver cómo funciona
            </Link>
            <span className="text-sm opacity-70">no pide tarjeta · no pide nada</span>
          </div>
        </section>
      </div>

      {/* MARQUEE — barrios con precios */}
      <div className="relative overflow-hidden whitespace-nowrap border-b-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-ink)] py-[22px] text-[var(--landing-paper)] md:py-[30px]">
        <div
          className="landing-marquee-label absolute bottom-0 left-0 top-0 z-[3] flex items-center gap-2 border-r-[1.5px] border-[var(--landing-paper)] bg-[var(--landing-hot)] px-3 font-mono font-bold uppercase text-[var(--landing-paper)] md:px-[18px]"
          style={{ fontSize: "12px", letterSpacing: "0.18em" }}
        >
          LIVE · DEL PAÍS
        </div>
        <div className="landing-marquee-track">
          {[...BARRIOS, ...BARRIOS].map((b, i) => (
            <span key={`m-${i}`}>
              <span className="item">
                {b.text} <span className="price">{b.price}</span>
              </span>
              <span className={`sep${b.sep === "b" ? " b" : ""}`}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* /JOBS */}
      <section
        id="jobs"
        className="mx-auto max-w-[1280px] px-[18px] py-[76px] md:px-7 md:py-[110px]"
      >
        <div className="mb-[18px] flex items-center gap-2 font-mono text-[13px]">
          <span className="inline-block h-[1.5px] w-7 bg-[var(--landing-ink)]" />
          / 01 — qué le vendés a quién
        </div>
        <h2
          className="landing-display mb-9 max-w-[880px] md:mb-[60px]"
          style={{
            fontSize: "clamp(36px, 5.5vw, 68px)",
            lineHeight: 0.96,
            letterSpacing: "-0.038em",
          }}
        >
          los negocios de tu cuadra{" "}
          <span
            className="landing-hand inline-block text-[var(--landing-hot)]"
            style={{ transform: "rotate(-2deg)" }}
          >
            no tienen página.
          </span>{" "}
          casi ninguno.
        </h2>
        <p
          className="-mt-5 mb-9 max-w-[640px] text-[16px] md:-mt-9"
        >
          arrancan los negocios porque ahí está la plata fácil. pero también
          podés hacer un{" "}
          <strong className="bg-[var(--landing-blue)] px-1 font-semibold">
            bot de whatsapp
          </strong>{" "}
          pa la peluquería de tu tía, un{" "}
          <strong className="bg-[var(--landing-acid)] px-1 font-semibold">
            minijuego
          </strong>{" "}
          pa vender a tus amigos, o lo que se te ocurra. la IA hace lo que le
          pidas.
        </p>

        <div
          className="grid grid-cols-1 border-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-ink)] md:grid-cols-2"
          style={{ gap: "1.5px" }}
        >
          {JOBS.map((job) => (
            <div
              key={job.tag}
              className="landing-job relative bg-[var(--landing-paper)] p-8"
            >
              <span
                className="mb-4 inline-block rounded-[3px] bg-[var(--landing-ink)] px-[9px] py-1 font-mono text-[12px] tracking-wider text-[var(--landing-paper)]"
              >
                {job.tag}
              </span>
              <h3
                className="landing-display mb-3"
                style={{ fontSize: "28px", lineHeight: 1.05, letterSpacing: "-0.025em" }}
              >
                {job.h}
              </h3>
              <p className="mb-[22px] text-[15px] leading-[1.5] opacity-80">
                {job.p}
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="landing-job-price">{job.price}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-paper-2)] px-2.5 py-1 font-mono text-[12px] font-bold tracking-wider"
                >
                  <span className="inline-block h-[7px] w-[7px] rounded-full bg-[var(--landing-blue)]" />
                  {job.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* /CHAT — Don Carlos */}
      <div
        id="chat"
        className="border-b-[1.5px] border-t-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-paper-2)]"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-[18px] py-[76px] md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:px-7 md:py-[110px]">
          <div>
            <div className="mb-[18px] flex items-center gap-2 font-mono text-[13px]">
              <span className="inline-block h-[1.5px] w-7 bg-[var(--landing-ink)]" />
              / 02 — así se cierra un trato
            </div>
            <h2
              className="landing-display mb-6"
              style={{
                fontSize: "clamp(36px, 5.5vw, 68px)",
                lineHeight: 0.96,
                letterSpacing: "-0.038em",
              }}
            >
              no es venderle a un CEO. es escribirle un whatsapp{" "}
              <span
                className="landing-hand inline-block text-[var(--landing-blue)]"
                style={{ transform: "rotate(-2deg)" }}
              >
                a don carlos.
              </span>
            </h2>
            <p className="mb-[18px] max-w-[480px] text-[18px] leading-[1.55]">
              te pasamos el guión. abono 50%, entregás, cobrás el resto. simple.
              sin facturas raras, sin contrato de 8 páginas.
            </p>
            <div
              className="landing-hand mt-3 inline-block text-[26px] text-[var(--landing-blue)]"
              style={{
                transform: "rotate(-1.5deg)",
                textShadow: "1.5px 1.5px 0 var(--landing-ink)",
              }}
            >
              ↓ chat real (con permiso de juan, 15) ↓
            </div>
          </div>

          {/* Chat mock */}
          <div
            className="mx-auto max-w-[400px] overflow-hidden rounded-[18px] border-[1.5px] border-[var(--landing-ink)] md:ml-auto md:mr-5"
            style={{
              background: "#ECE5DD",
              boxShadow: "var(--landing-shadow-lg)",
              transform: "rotate(0.5deg)",
            }}
          >
            <div
              className="flex items-center gap-3 px-4 py-[14px] text-white"
              style={{ background: "#075E54" }}
            >
              <span className="text-[20px]">‹</span>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-[20px]"
                style={{
                  background: "#ffd166",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                🥖
              </div>
              <div>
                <div className="text-[15px] font-semibold leading-[1.1]">
                  Don Carlos (panadería)
                </div>
                <div className="mt-0.5 text-[11px] opacity-85">en línea</div>
              </div>
            </div>
            <div
              className="flex flex-col gap-1.5 px-2.5 pb-[18px] pt-[14px]"
              style={{
                backgroundColor: "#ECE5DD",
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, rgba(0,0,0,0.025) 0, transparent 30%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.025) 0, transparent 30%)",
              }}
            >
              {CHAT_BUBBLES.map((b, i) => (
                <div
                  key={i}
                  className={`relative max-w-[78%] rounded-lg px-2.5 pb-[5px] pt-[7px] text-[14px] leading-[1.35] ${
                    b.side === "me"
                      ? "self-end rounded-tr-none"
                      : "self-start rounded-tl-none bg-white"
                  }`}
                  style={{
                    background: b.side === "me" ? "#DCF8C6" : "white",
                    boxShadow: "0 1px 0.5px rgba(0,0,0,0.08)",
                    fontFamily: "var(--font-grotesk), system-ui, sans-serif",
                  }}
                >
                  {b.text}{" "}
                  <span className="ml-1.5 inline whitespace-nowrap text-[10px] opacity-50">
                    {b.time}
                    {b.side === "me" && (
                      <span style={{ color: "#4fc3f7" }}> ✓✓</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center gap-2.5 px-3 py-2"
              style={{
                background: "#f0f0f0",
                borderTop: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <span className="text-[18px]">😊</span>
              <div
                className="flex-1 rounded-[18px] bg-white px-3 py-2 text-[13px]"
                style={{ color: "#888" }}
              >
                escribir mensaje…
              </div>
              <button
                type="button"
                aria-disabled="true"
                tabIndex={-1}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] text-white"
                style={{ background: "#075E54" }}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* /3-PASOS */}
      <section
        id="cosa"
        className="mx-auto max-w-[1280px] px-[18px] py-[76px] md:px-7 md:py-[110px]"
      >
        <div className="mb-[18px] flex items-center gap-2 font-mono text-[13px]">
          <span className="inline-block h-[1.5px] w-7 bg-[var(--landing-ink)]" />
          / 03 — cómo es la cosa
        </div>
        <h2
          className="landing-display mb-9 max-w-[880px] md:mb-[60px]"
          style={{
            fontSize: "clamp(36px, 5.5vw, 68px)",
            lineHeight: 0.96,
            letterSpacing: "-0.038em",
          }}
        >
          funciona como un{" "}
          <span
            className="landing-hand inline-block text-[var(--landing-hot)]"
            style={{ transform: "rotate(-2deg)" }}
          >
            cuaderno de chat.
          </span>
        </h2>

        <div className="flex flex-col border-t-[1.5px] border-[var(--landing-ink)]">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className="landing-step relative grid items-start gap-[18px] border-b-[1.5px] border-[var(--landing-ink)] py-[30px] md:gap-9 md:py-11"
            >
              <div
                className="landing-display landing-step-num"
                style={{
                  fontSize: "clamp(60px, 9vw, 110px)",
                  lineHeight: 0.82,
                  letterSpacing: "-0.06em",
                }}
              >
                {s.num}
                <span className="slash text-[var(--landing-hot)]">/</span>
              </div>
              <div>
                <h3
                  className="landing-display mb-3"
                  style={{
                    fontSize: "clamp(22px, 3vw, 34px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.028em",
                  }}
                >
                  {s.h}
                </h3>
                <p
                  className="max-w-[600px] opacity-90"
                  style={{ fontSize: "17px", lineHeight: 1.55 }}
                >
                  {s.p}
                </p>
                <span
                  className="mt-2.5 inline-block bg-[var(--landing-ink)] px-2.5 py-1 font-mono text-[12px] text-[var(--landing-paper)] md:hidden"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {s.time}
                </span>
              </div>
              <span
                className="hidden self-start whitespace-nowrap bg-[var(--landing-ink)] px-2.5 py-1 font-mono text-[12px] text-[var(--landing-paper)] md:inline"
                style={{ gridColumn: 3 }}
              >
                {s.time}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* /FAQ */}
      <section
        id="faq"
        className="mx-auto max-w-[1280px] px-[18px] py-[76px] md:px-7 md:py-[110px]"
      >
        <div className="mb-[18px] flex items-center gap-2 font-mono text-[13px]">
          <span className="inline-block h-[1.5px] w-7 bg-[var(--landing-ink)]" />
          / 04 — preguntas que ya nos hicieron
        </div>
        <h2
          className="landing-display mb-9 max-w-[880px] md:mb-[60px]"
          style={{
            fontSize: "clamp(36px, 5.5vw, 68px)",
            lineHeight: 0.96,
            letterSpacing: "-0.038em",
          }}
        >
          si vos lo pensaste, otro parcero ya lo preguntó.
        </h2>

        <div className="flex flex-col border-t-[1.5px] border-[var(--landing-ink)]">
          {FAQS.map((item, i) => {
            const num = String(i + 1).padStart(3, "0");
            const spotlight = item.spotlight;
            return (
              <div
                key={num}
                className={`landing-faq-item relative grid grid-cols-1 items-start gap-1 border-b-[1.5px] border-[var(--landing-ink)] py-7 md:grid-cols-[100px_1fr] md:gap-[30px] ${
                  spotlight ? "border-l-4 border-l-[var(--landing-blue)] pl-[14px] md:pl-[18px]" : ""
                }`}
                style={
                  spotlight
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(56,182,255,0.18), transparent 70%)",
                      }
                    : undefined
                }
              >
                <div
                  className={`font-mono text-[13px] md:pt-1.5 ${
                    spotlight ? "font-bold text-[var(--landing-blue)] opacity-100" : "opacity-50"
                  }`}
                >
                  {num}
                </div>
                <div>
                  <div
                    className="landing-faq-q landing-display mb-2.5"
                    style={{
                      fontSize: "clamp(19px, 2.5vw, 24px)",
                      fontWeight: 700,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.15,
                    }}
                  >
                    {item.q}
                  </div>
                  <div
                    className="max-w-[760px] opacity-90"
                    style={{ fontSize: "16px", lineHeight: 1.6 }}
                  >
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      <div
        id="empezar"
        className="relative overflow-hidden bg-[var(--landing-ink)] px-[18px] py-20 text-center text-[var(--landing-paper)] md:px-7 md:pb-[110px] md:pt-[130px]"
      >
        <div
          className="landing-display pointer-events-none absolute select-none"
          aria-hidden="true"
          style={{
            fontSize: "28vw",
            lineHeight: 1,
            color: "rgba(244,236,214,0.07)",
            letterSpacing: "-0.05em",
            bottom: "-8vw",
            left: "-2vw",
            zIndex: 1,
          }}
        >
          maluwa.
        </div>
        <div className="relative z-[2] mx-auto max-w-[1100px]">
          <h2
            className="landing-display mb-7"
            style={{
              fontSize: "clamp(42px, 8vw, 108px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.92,
            }}
          >
            el primer cliente
            <br />
            es{" "}
            <span
              className="landing-hand inline-block text-[var(--landing-acid)]"
              style={{ transform: "rotate(-3deg)" }}
            >
              tu mamá.
            </span>
            <br />
            no te va a decir que no.
          </h2>
          <p className="mx-auto mb-11 max-w-[480px] text-[19px] opacity-80">
            tan simple como hablarle a un parcero que sabe convertir ideas en
            proyectos. arrancá hoy — mañana tenés algo pa mostrar.
          </p>
          <Link href="/diario/demo" className="landing-final-btn">
            empezar a crear <span className="em">→</span>
          </Link>
          <div className="mt-7">
            <span
              className="landing-hand inline-block bg-[var(--landing-blue)] px-3.5 py-1.5 text-[22px] text-[var(--landing-ink)]"
              style={{
                border: "1.5px solid var(--landing-paper)",
                transform: "rotate(-2.5deg)",
              }}
            >
              ↓ ya, en serio. dale ↓
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative overflow-hidden border-t-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-paper)] pb-24 md:pb-0">
        {/* mini-marquee */}
        <div className="relative overflow-hidden whitespace-nowrap border-b-[1.5px] border-[var(--landing-ink)] bg-[var(--landing-paper-2)] py-3">
          <div
            className="landing-footer-marquee-track font-mono"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {[...FOOTER_MARQUEE, ...FOOTER_MARQUEE].map((item, i) => (
              <span key={`fm-${i}`}>
                {item.t}{" "}
                <span className={`dot${item.d === "b" ? " b" : ""}`}>●</span>
              </span>
            ))}
          </div>
        </div>

        {/* sticker tabs */}
        <div className="pointer-events-none relative z-[5] mx-auto h-0 max-w-[1280px] overflow-visible">
          <div
            className="landing-f-sticker pink"
            style={{
              top: "-18px",
              right: "18px",
              fontSize: "14px",
              padding: "6px 10px",
              transform: "rotate(6deg)",
            }}
          >
            la primera plata<br />es tuya.
          </div>
          <div
            className="landing-f-sticker blue"
            style={{
              top: "-20px",
              left: "18px",
              fontSize: "13px",
              padding: "6px 10px",
              transform: "rotate(-5deg)",
            }}
          >
            no somos un colegio.
          </div>
        </div>

        <div
          className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-8 px-[18px] py-12 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-10 md:px-7 md:py-[76px]"
        >
          <div className="sm:col-span-2 md:col-span-1">
            <div
              className="landing-display mb-3"
              style={{
                fontSize: "38px",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              maluwa<span className="text-[var(--landing-hot)]">.</span>
            </div>
            <p className="mb-[18px] max-w-[280px] text-[14px] leading-[1.55] opacity-80">
              un cuaderno de chat pa pelaos colombianos que quieren convertir
              ideas en proyectos reales — y cobrarlos.
            </p>
            <span
              className="landing-hand inline-block bg-[var(--landing-blue)] px-3 py-1.5 text-[18px] text-[var(--landing-ink)]"
              style={{
                border: "1.5px solid var(--landing-ink)",
                transform: "rotate(-3deg)",
                boxShadow: "var(--landing-shadow-sm)",
                lineHeight: 1,
              }}
            >
              made in colombia · {year}
            </span>

            <div className="mt-3.5 font-mono text-[11px] leading-[1.6] opacity-70">
              hecho con sancocho desde
              <br />
              <span className="font-bold text-[var(--landing-ink)] opacity-100">bogotá</span>{" "}
              ·{" "}
              <span className="font-bold text-[var(--landing-blue)] opacity-100">medellín</span>{" "}
              ·{" "}
              <span className="font-bold text-[var(--landing-hot)] opacity-100">cali</span>{" "}
              ·{" "}
              <span className="font-bold text-[var(--landing-ink)] opacity-100">cartagena</span>{" "}
              ·{" "}
              <span className="font-bold text-[var(--landing-blue)] opacity-100">barranquilla</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3.5 font-mono text-[11px] uppercase tracking-wider opacity-60">
              navegá
            </h4>
            <ul className="flex list-none flex-col gap-2">
              <li>
                <Link href="#cosa" className="landing-footer-link">
                  <span className="arr">›</span>cómo es la cosa
                </Link>
              </li>
              <li>
                <Link href="#jobs" className="landing-footer-link">
                  <span className="arr">›</span>qué vendés
                </Link>
              </li>
              <li>
                <Link href="#faq" className="landing-footer-link">
                  <span className="arr">›</span>preguntas
                </Link>
              </li>
              <li>
                <Link href="/diario/demo" className="landing-footer-link">
                  <span className="arr">›</span>arrancar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3.5 font-mono text-[11px] uppercase tracking-wider opacity-60">
              el código
            </h4>
            <ul className="flex list-none flex-col gap-2">
              <li>
                <a
                  href="https://github.com/danieltalero/maluwa"
                  className="landing-footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="arr">›</span>github
                </a>
              </li>
              <li>
                <Link href="/sobre" className="landing-footer-link">
                  <span className="arr">›</span>manifiesto
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="landing-footer-link">
                  <span className="arr">›</span>privacidad
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="landing-footer-link">
                  <span className="arr">›</span>términos (cortos)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3.5 font-mono text-[11px] uppercase tracking-wider opacity-60">
              hablanos
            </h4>
            <ul className="flex list-none flex-col gap-2">
              <li>
                <Link href="/sobre" className="landing-footer-link">
                  <span className="arr">›</span>whatsapp directo
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="landing-footer-link">
                  <span className="arr">›</span>discord parceros
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="landing-footer-link">
                  <span className="arr">›</span>instagram
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="landing-footer-link">
                  <span className="arr">›</span>tiktok
                </Link>
              </li>
            </ul>
            <div className="mt-[18px] flex items-center gap-2 font-mono text-[12px]">
              <span className="landing-pulse inline-block h-2 w-2 rounded-full bg-[var(--landing-hot)]" />
              <span className="font-bold">1.247</span> conectados ahora
            </div>
          </div>
        </div>

        <div
          className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-3.5 px-[18px] py-[18px] font-mono text-[12px] opacity-85 md:flex-row md:flex-wrap md:items-center md:px-7"
          style={{ borderTop: "1.5px dashed rgba(26,22,18,0.35)" }}
        >
          <div>maluwa.app · v0.4 · open-source · MIT · hecho desde Colombia · {year}</div>
          <div
            className="hidden font-mono text-[11px] opacity-55 sm:block"
            style={{ whiteSpace: "pre" }}
          >
            [ ⌐■_■ ] &lt;&lt; el código es del que lo escribe.
          </div>
          <div>
            con{" "}
            <span
              className="landing-hand inline-block text-[18px] text-[var(--landing-hot)]"
              style={{ transform: "rotate(-2deg)" }}
            >
              cariño
            </span>{" "}
            desde colombia.{" "}
            <Link href="/privacidad" className="underline-offset-2 hover:underline">
              privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
