# MVP de Maluwa — Versión 1

Documento de producto. Define qué entra en la **primera versión** que se lleva al primer colegio. Resuelve uno de los puntos abiertos en `MARCO.md §7`.

> **Criterio rector:** lo mínimo para que un estudiante de 14 años, sentado en una sala de informática, complete **un proyecto real publicado en internet** en menos de 4 horas acumuladas. Si algo no contribuye a eso, no entra en MVP.

---

## 1. Hipótesis de producto

> *Si un adolescente puede, en una sola tarde, **publicar una página real** que su mamá puede abrir en su celular, entonces se engancha. Todo lo demás — gamificación, perfiles, badges, comunidad — es accesorio en v1.*

El MVP existe para validar o refutar esa hipótesis. No para ser bonito, no para escalar, no para impresionar inversionistas (no hay).

---

## 2. Lo que SÍ entra en v1

### 2.1 Onboarding mínimo
- Registro por email + contraseña (sin OAuth en v1 — agrega complejidad de privacidad para menores).
- Captura de: nombre, edad, ciudad, colegio (texto libre, no catálogo).
- **Consentimiento informado:** checkbox + link a política. Para 12-13: campo de email del padre/madre que recibe aviso.
- 3 preguntas de interés ("¿qué te gustaría construir?") → sugieren proyecto inicial.

### 2.2 Tronco común — 1 sola lección
**"¿Qué es una página web y cómo se hace con IA?"** — 15 minutos máximo, formato mixto (texto corto + 1 video embebido + 1 ejercicio interactivo).

Una sola lección. No diez. La tentación de "currículo completo" mata el MVP.

### 2.3 Un (1) proyecto de bifurcación funcional
Para v1 elegimos **uno solo** de la lista de `PROYECTOS.md` — el que tenga mejor relación impacto/complejidad técnica. Propuesta inicial: **"Página para el negocio de tu casa"** (ver `PROYECTOS.md §1`).

Los otros 2-4 proyectos quedan como "Próximamente" en la UI — visibles pero no clickables. Es marketing interno, no funcionalidad.

### 2.4 El diario conversacional (corazón del producto)

**Inspiración UX:** [superr.ai](https://www.superr.ai/) — un cuaderno donde la IA "aparece cuando te trabas, te da pistas, no respuestas". Adaptado al dominio de Maluwa: un cuaderno donde la página o app del estudiante se va materializando a partir de una conversación.

**Cómo funciona:**
- Pantalla vertical tipo "feed", mobile-first. Cada elemento del feed es una **entrada del diario**.
- Tipos de entrada:
  - **Pregunta de la IA** ("¿De qué se trata el negocio? ¿Qué te hace especial?").
  - **Respuesta del estudiante** (texto, foto, audio en v2).
  - **Tarjeta de recurso** generada por la IA: paleta de colores sugerida, plantilla de texto, ejemplo visual, lista de fotos a tomar.
  - **Snapshot del proyecto** ("Así se ve tu página ahora" — preview embebido).
- La IA siempre **conduce con la próxima pregunta**. El estudiante nunca queda mirando un cursor parpadeando sin saber qué hacer.
- Botón "ver cómo está hecho por dentro" — abre un panel lateral con el HTML/CSS generado. Transparencia pedagógica: el estudiante puede aprender mirando, sin estar obligado.

**Lo que esto reemplaza:**
- ❌ Editor de código manual (Monaco/CodeMirror) — fuera de v1.
- ❌ Botón flotante de tutor separado — el tutor **es** el diario.
- ❌ Concepto de "lección + ejercicio + tutor" como pantallas separadas — se funden en el feed conversacional.

**Modelo de IA en v1:**
- Conversación general: Claude Haiku 4.5.
- Generación de HTML/CSS: Claude Sonnet 4.6 (vale la pena el costo extra: el output se ve directo).
- Sin memoria persistente entre sesiones aún — cada visita reanuda la última conversación cargando el feed completo.
- **Límite duro de costo:** 50 turnos de conversación/día por estudiante.

### 2.5 Preview en vivo

- Panel lateral (desktop) o pestaña (mobile) que muestra la página que se está construyendo.
- Actualiza en cada nueva versión generada por la IA.
- HTML/CSS/JS plano servido en sandbox iframe. Sin npm, sin build step.

### 2.6 Publicación con un click
- Botón "Publicar" → genera subdominio `<usuario>.maluwa.app`.
- Hosting estático (Vercel o Cloudflare Pages, lo que sea más barato a 1000 sitios).
- URL compartible (WhatsApp es el target, no LinkedIn).

### 2.7 Dashboard mínimo
- Lista de "Mis proyectos" (en v1 será 0 o 1).
- Botón "Empezar nuevo proyecto" (en v1 lleva al único proyecto disponible).
- Link a "Mi página publicada".

### 2.8 Página pública del proyecto
- Cuando el estudiante publica, queda accesible en `<usuario>.maluwa.app`.
- Footer pequeño y discreto: "Hecho con Maluwa".

---

## 3. Lo que NO entra en v1

Lista deliberada — útil para resistir scope creep:

- ❌ Múltiples proyectos de bifurcación funcionales (solo 1).
- ❌ Sistema de badges, niveles, XP, gamificación.
- ❌ Comunidad / muro / comentarios entre estudiantes.
- ❌ Mensajería estudiante-estudiante o estudiante-tutor humano.
- ❌ Panel de profesor / panel de colegio.
- ❌ Métricas pedagógicas finas (tiempo en lección, tasa de error).
- ❌ Memoria persistente del tutor IA entre sesiones.
- ❌ Modo offline / PWA instalable (PWA sí, instalable y offline no).
- ❌ Pagos, monetización dentro de la plataforma.
- ❌ Multi-idioma (solo español-CO en v1).
- ❌ Versionado / git de los proyectos del estudiante.
- ❌ Custom domains de los chicos (solo subdominios `*.maluwa.app`).
- ❌ App móvil nativa.
- ❌ Integraciones con TikTok/Instagram para "publicar tu reel".
- ❌ Analytics avanzado, A/B testing.

Cada uno de estos puede ser v2, v3 o nunca. No es deuda — es alcance.

---

## 4. Métricas de éxito del MVP

Resuelve `MARCO.md §6 Riesgo #5` para esta fase.

### Métrica primaria
**Tasa de completación de un proyecto publicable en la primera sesión** (sesión = visita única, idealmente la charla en el colegio).

- Meta: ≥30% de los estudiantes que se registran publican algo en sesión 1.
- Si <10% → el MVP está roto, hay que rediseñar UX antes de seguir agregando.

### Métrica secundaria
**Retención semana 2:** % de estudiantes registrados que vuelven al menos una vez en los 14 días siguientes a registro.

- Meta: ≥15%.
- Es bajo a propósito — adolescentes son volátiles, no es Netflix.

### Métricas que **NO** importan en MVP
- DAU / MAU.
- Tiempo en plataforma.
- Número de mensajes al tutor IA (más no es mejor).
- Número de páginas publicadas (1 buena > 10 abandonadas).

---

## 5. Criterios de "listo para llevar al primer colegio"

Checklist binaria. Si alguno falla, no se va a colegios todavía.

- [ ] Un estudiante puede registrarse, completar la lección, publicar su página y compartirla por WhatsApp en una sesión de 90 minutos sin ayuda externa.
- [ ] La política de privacidad existe, está revisada, y es comprensible para un padre de familia colombiano sin formación legal.
- [ ] Costo de IA por estudiante activo está medido y proyectado para 100 estudiantes/mes — y existe presupuesto para sostenerlo 6 meses.
- [ ] El subdominio `<usuario>.maluwa.app` funciona end-to-end con HTTPS.
- [ ] Existe un mecanismo de soporte (aunque sea un email atendido por el autor) para cuando algo se rompa en clase.
- [ ] El tutor IA no produce contenido inapropiado en 50 prompts adversariales de prueba (jailbreak básico, lenguaje inapropiado, contenido sexual, instrucciones peligrosas).

---

## 6. Fases sugeridas hasta v1

Estimaciones gruesas del autor solo, sin equipo:

| Fase | Entregable | Tiempo estimado |
|---|---|---|
| **F0 — Mockups** | 5 pantallas en Figma (las del MARCO §7) | 1-2 semanas |
| **F1 — Scaffold técnico** | Repo, Next.js + Postgres + auth, deploy a DO funcionando | 2 semanas |
| **F2 — Tronco común** | 1 lección completa, contenido + UI | 2 semanas |
| **F3 — Proyecto bifurcado** | Editor + preview + publicación del proyecto elegido | 3-4 semanas |
| **F4 — Tutor IA** | Integración Claude + prompts + límites de costo | 1-2 semanas |
| **F5 — Privacidad y onboarding** | Consentimiento, política, registro de menores | 1 semana |
| **F6 — Pruebas de aula simuladas** | Probar con 2-3 sobrinos/conocidos del rango etario | 1 semana |

**Total realista:** 11-14 semanas de trabajo del autor a tiempo parcial. Fechar contra calendario real, no contra fantasía.

---

## 7. Decisiones aún abiertas dentro del MVP

- ⬜ ¿Vercel o Cloudflare Pages para hosting de proyectos publicados? (decidir cuando se sepa el costo a 1000 sitios).
- ⬜ ¿Monaco o CodeMirror? (decidir en F1, prototipar ambos en 1 día).
- ⬜ ¿Email de aviso al padre se envía siempre o solo para 12-13? (resolver con asesoría legal o inspirándose en cómo lo hace, p. ej., Khan Academy Kids).
- ⬜ ¿La lección del tronco común es texto + video o solo texto? (decidir en F0 con base en el mockup).
