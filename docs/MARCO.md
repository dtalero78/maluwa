# Marco General del Proyecto — Maluwa

Documento estratégico y de producto. Define el "qué", el "para quién" y el "por qué" de Maluwa. No es un documento técnico — para arquitectura y stack ver `docs/ARCHITECTURE.md` (cuando exista).

> **Nota:** Este documento captura las decisiones de diseño tomadas en la fase inicial (abril 2026). Es una foto en el tiempo. Si una decisión cambia, actualizar aquí y dejar registro en el historial de git.

---

## 1. Identidad y propósito

| Atributo | Valor |
|---|---|
| **Nombre** | Maluwa |
| **Dominio** | maluwa.app |
| **Naturaleza** | Proyecto personal sin ánimo de lucro, open-source (MIT) |
| **Misión** | Dar a adolescentes hispanohablantes de recursos limitados las herramientas para sentirse capaces de crear servicios digitales con IA y monetizarlos en su comunidad |
| **Objetivo profesional del autor (separado)** | Posicionarse como desarrollador/consultor independiente para sector público colombiano. Maluwa es **una pieza de portafolio entre varias** — no es el vehículo principal de ese posicionamiento |

---

## 2. Audiencia

| Atributo | Valor |
|---|---|
| **Audiencia primaria** | Adolescentes 12-17, estratos bajos, hispanohablantes, comenzando por Colombia |
| **Cliente** | Los estudiantes mismos. **NO** las Secretarías de Educación, **NO** los colegios como instituciones |
| **Pre-requisitos asumidos** | Acceso a computador (en colegio o casa) e internet razonablemente estable. Modelo offline-first descartado en esta fase |

### Implicación importante

Maluwa **no es una "plataforma para escuelas"**. Las escuelas son canal de distribución (mercadeo de pasillo), no clientes. Esta distinción evita decisiones contradictorias en producto, UX y privacidad.

---

## 3. Producto

### Tema único

Crear páginas web y aplicaciones con IA. Una sola vertical, profundidad sobre amplitud.

### Promesa de monetización aspiracional

Que los chicos sientan que pueden generar ingresos. Dos modos centrales:

- **Servicios locales en su comunidad** — páginas para la panadería, la peluquería, la iglesia del barrio. Tickets bajos ($100K–$500K COP), mercado infinito, accesible desde los 14.
- **Creator economy** — TikTok/YouTube mostrando lo que construyen. El aprendizaje mismo es activo de contenido.

Modos explícitamente **no** centrales en fase inicial: freelancing global, productos SaaS propios, empleo formal. Pueden aparecer como "track 2" para los más avanzados.

### Modelo pedagógico

**Un track con bifurcaciones por proyecto.**

- **Tronco común corto** — fundamentos obligatorios (qué es la web, qué es la IA, cómo se usa Claude/ChatGPT como herramienta).
- **Bifurcaciones por proyecto** elegibles según interés del estudiante:
  - "Hacer una página para el negocio de tu casa"
  - "Crear un meme generador con IA"
  - "Construir un bot de Telegram para tu comunidad"
  - "Editar reels para TikTok con IA"
  - (lista no exhaustiva — definir 3-5 proyectos para MVP)

**No** es currículo lineal tipo Khan Academy. **No** es chat libre tipo ChatGPT. Es un híbrido: estructura ligera + agencia del estudiante.

### Voz y tono

**Adolescente cómplice.** Cercano, con humor, sin caer en vulgaridad. Referencia: Duolingo en redes. La voz debe sentirse como un parcero que sabe hacer plata con código, no como un profesor.

### Formato de aprendizaje

IA como **copiloto sobre contenido estructurado** (no chat-only):

- Lecciones cortas curadas.
- Ejercicios generados por IA, adaptados al proyecto del estudiante.
- Tutor IA siempre accesible vía botón.
- Evaluación abierta con feedback pedagógico de IA.

---

## 4. Tecnología (referencia, ver `ARCHITECTURE.md` para detalle)

| Capa | Decisión |
|---|---|
| **Frontend** | Next.js + React, PWA, mobile-first (muchos chicos solo tendrán celular) |
| **Backend** | Node.js o Python — orquestador entre cliente y LLMs |
| **Base de datos** | PostgreSQL |
| **Hosting** | DigitalOcean (alineado con stack existente del autor) |
| **IA — Tutor** | Claude Haiku 4.5 para charla general; Sonnet 4.6 para casos complejos |
| **IA — Ejercicios** | Claude con prompts estructurados + JSON schema |
| **IA — Evaluación de código** | Claude Sonnet 4.6 |
| **RAG** | Vectorización del propio currículo curado de Maluwa (no MEN, no institucional) |
| **Caching de IA** | Caché agresivo de respuestas comunes — esencial para controlar costo |
| **Hosting de proyectos de los chicos** | Integración con Vercel/Netlify para deploy con un click; subdominios `*.maluwa.app` en fase 1 |
| **Stack base** | Construcción **custom**. Descartados forks de Kolibri, Oppia, Moodle |

---

## 5. Distribución y crecimiento

| Atributo | Valor |
|---|---|
| **Canal primario** | **Mercadeo de pasillo (Versión A)** — visitas físicas a colegios públicos, charlas de 30 min en clases de informática, QRs/stickers, captura de inscripciones individuales. **Sin convenios institucionales.** |
| **Canal secundario implícito** | Boca a boca entre estudiantes; profes individuales que recomiendan |
| **Canales descartados (por ahora)** | TikTok/YouTube como canal primario, alianzas con Secretarías, alianzas con ONG |
| **Meta realista año 1** | 5–20 colegios visitados, 300–2000 estudiantes registrados, 30–100 estudiantes "enganchados de verdad" |

### Implicaciones operativas de la Versión A

**NO necesita:**
- SIMAT u otra integración con sistemas oficiales.
- Alineación curricular MEN.
- Reportes para Secretarías de Educación.
- Convenios institucionales.

**SÍ necesita:**
- Política de privacidad propia.
- Consentimiento informado de padres para menores de 14.
- Permiso simple de rector/coordinador para entrar al aula.
- UX de inscripción 100% individual del estudiante (la plataforma no asume "grupo escolar" como unidad).

### Expectativa realista

El mercadeo de pasillo tiene techo bajo en alcance — pero esa es una característica, no un defecto, para un proyecto personal sin ánimo de lucro. **300 usuarios enganchados de verdad es un éxito enorme** en este modelo. No perseguir vanity metrics.

---

## 6. Riesgos abiertos

Decisiones **no resueltas** que el autor debe trabajar antes o durante el desarrollo:

1. **Costo operativo de IA.** ¿De dónde sale la plata para Claude API? ¿Bolsillo propio? ¿Anthropic for Startups? ¿Programa educativo de Anthropic? Calcular antes de codear — puede matar el proyecto en mes 3.
2. **Privacidad de menores.** Datos de niños 12-17 enviados a servidores de Anthropic en EE.UU. Implicaciones bajo Ley 1581 colombiana. Mínimo necesario: política de privacidad, consentimiento informado para 14+, consentimiento de padres para 12-13.
3. **Validación pedagógica.** ¿Cómo se asegura que efectivamente *aprenden*? Necesario al menos un asesor con perfil pedagógico, aunque sea informal.
4. **Capacidad operativa de mercadeo de pasillo.** ¿Cuántos colegios al mes está dispuesto el autor a visitar? Sin esto, distribución es 0.
5. **Definición de "enganche".** ¿Qué métrica define éxito? ¿Login a la semana? ¿Un proyecto publicado por mes? ¿Un primer cliente real? Definir antes, no después.
6. **Continuidad del proyecto.** ¿Cuántas horas/semana? ¿Qué condición declara éxito y qué condición declara cierre?

---

## 7. Decisiones todavía pendientes

- ✅ ~~Nombre y dominio~~ → Maluwa / maluwa.app
- ⬜ Versión A vs B del mercadeo en colegios → **Resuelto: Versión A**
- ⬜ Métrica de éxito explícita (ver Riesgo #5)
- ⬜ Modelo de financiamiento del costo de IA (ver Riesgo #1)
- ⬜ Definición concreta del MVP — qué incluye exactamente la versión 1 que se lleva al primer colegio
- ⬜ Lista concreta de 3-5 proyectos del currículo de bifurcaciones
- ⬜ Mockup de las 5 pantallas clave (onboarding, lección, tutor IA, vista de proyecto, dashboard del chico)

---

## 8. Pasos sugeridos antes de escribir código

1. Resolver Versión A vs B del mercadeo → **hecho**.
2. Visitar 2-3 colegios para hacer entrevistas (no demos).
3. Calcular costo estimado de IA por mes para 100 estudiantes activos.
4. Definir 3-5 proyectos concretos del currículo.
5. Hacer mockup en Figma de 5 pantallas clave.

Si todo lo anterior resiste el contacto con la realidad, se construye. Si no, se ajusta sin haber gastado código.
