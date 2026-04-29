# Proyectos del currículo de bifurcación

Documento de producto. Define los 3-5 proyectos concretos del modelo pedagógico de Maluwa (`MARCO.md §3`).

> **Criterio de selección:** un proyecto entra en esta lista solo si cumple **los cuatro**:
> 1. Se puede terminar en 2-4 sesiones de 90 minutos.
> 2. Tiene un resultado **tangible y compartible** por WhatsApp.
> 3. Se conecta de forma natural con la promesa de monetización (servicios al barrio o creator economy).
> 4. Un estudiante de 14 años entiende de qué se trata sin necesidad de glosario.

Lista priorizada. **El proyecto #1 es el único que entra en MVP** (`MVP.md §2.3`). Los demás son backlog para v2+.

---

## 1. Página para el negocio de tu casa o tu barrio

**Resultado:** una página de una sola pantalla, publicada en `<usuario>.maluwa.app`, que muestra los servicios de un negocio real (la panadería de la esquina, la peluquería de tu mamá, la tienda de la abuela).

**Por qué este es el #1:**
- Aterriza la promesa de monetización directamente — el primer "cliente" puede ser literalmente un familiar.
- Tecnológicamente es lo más simple: HTML/CSS estático, sin estado, sin auth, sin base de datos del estudiante.
- El feedback social es inmediato — la mamá lo abre en su celular y dice "uy, qué bonito".
- Encaja con el formato físico de "te vendo una página por $100K" que el marco menciona.

**Componentes que el estudiante toca:**
- Estructura HTML básica: header, sección "qué hacemos", sección "contáctanos".
- CSS para colores, fuentes, una imagen de fondo.
- Un botón de WhatsApp con `wa.me/<número>`.
- Subir 1-3 fotos (el negocio real).

**Rol de la IA:**
- Generar el texto inicial a partir de 3-4 preguntas ("¿qué vende el negocio? ¿qué lo hace especial? ¿horarios?").
- Sugerir paleta de colores cuando el estudiante carga una foto del local.
- Revisar la página al final y dar feedback en tono "parcero".

**Aprendizajes implícitos:** qué es HTML, qué es CSS, qué es un dominio, cómo se publica algo en internet, cómo se le pasa una página a un cliente.

---

## 2. Meme generador con IA

**Resultado:** una mini-app web donde el usuario escribe un texto y recibe un meme generado (imagen + texto superpuesto), descargable y compartible.

**Por qué entra:**
- Conecta directo con creator economy / TikTok.
- Introduce el concepto de "API call" sin necesidad de explicarlo formalmente — la IA hace algo, devuelve algo.
- Es un proyecto que el estudiante usa él mismo después de construirlo (a diferencia del #1 que es para un tercero).

**Componentes que el estudiante toca:**
- HTML con un input y un botón.
- JS muy básico para enviar el texto al backend de Maluwa.
- Backend hace la llamada a Claude (vision/imagen) — esto está abstraído en un endpoint de Maluwa.
- CSS para que se vea bien al compartirlo.

**Rol de la IA:**
- Genera la imagen del meme (vía Claude o un modelo de imagen integrado).
- Ayuda a ajustar el prompt si el resultado no convence al estudiante.

**Aprendizajes implícitos:** qué es un input/output, qué es una API, por qué la IA "responde diferente" cada vez.

**Riesgo a vigilar:** moderación de contenido. Un adolescente con un meme generador y sin filtros es una bomba. Necesario filtrar prompts y outputs antes de v2.

---

## 3. Bot de Telegram para tu comunidad

**Resultado:** un bot funcional al que cualquiera en el grupo de WhatsApp/Telegram del salón le pregunta algo (tareas, horarios, información del barrio) y responde con IA.

**Por qué entra:**
- Apela al "ser útil al grupo", muy poderoso en la cultura adolescente colombiana.
- Introduce backend, persistencia simple, integraciones externas.
- Resultado escalable — el bot lo usan 30 personas, no solo el estudiante.

**Componentes que el estudiante toca:**
- Configurar el bot en Telegram (BotFather).
- Pegar el token en la consola de Maluwa.
- Definir 3-5 "intenciones" que su bot atiende (en lenguaje natural, no código).
- Probar el bot con sus compañeros.

**Rol de la IA:**
- Es el cerebro del bot — interpreta el mensaje y responde.
- Ayuda al estudiante a definir las intenciones del bot ("¿qué quieres que sepa hacer?").

**Aprendizajes implícitos:** qué es un servidor, por qué algunas cosas pasan "afuera" del navegador, qué significa que algo "está corriendo 24/7".

**Riesgo a vigilar:** mismo problema de moderación que el #2, multiplicado porque el bot es público.

---

## 4. Editor de reels con IA

**Resultado:** una herramienta que toma un video corto subido por el estudiante y le sugiere cortes, subtítulos automáticos, y un texto gancho para TikTok.

**Por qué entra:**
- Creator economy puro.
- El estudiante sale con un reel listo para publicar — utilidad inmediata, alta tasa de "uy genial".

**Componentes que el estudiante toca:**
- Subir un video corto.
- Revisar y editar los subtítulos sugeridos.
- Aplicar un "estilo" pre-construido.
- Descargar el resultado.

**Rol de la IA:**
- Transcripción del audio (Whisper o equivalente vía proxy).
- Sugerencia de cortes basados en silencios / cambios de tema.
- Generación del texto de hook para la descripción.

**Aprendizajes implícitos:** procesamiento de medios, qué es un archivo, por qué algunas cosas tardan más que otras (latencia de IA).

**Riesgo a vigilar:** este proyecto es **caro** (procesamiento de video + transcripción). Posiblemente mover a v3 cuando la economía esté validada.

---

## 5. Asistente personal del salón

**Resultado:** una mini-aplicación donde el estudiante registra sus materias, tareas y horarios, y la IA le ayuda a organizarse y le manda recordatorios.

**Por qué entra:**
- Utilidad personal directa — el estudiante lo usa cada día.
- Introduce concepto de base de datos (sus tareas se guardan), autenticación, notificaciones.
- Es el más "tradicional" técnicamente — sirve como pieza de portafolio para el estudiante que quiere entrar al mundo dev "serio".

**Componentes que el estudiante toca:**
- Formulario para crear tareas.
- Vista de lista.
- Botón "preguntarle a la IA": "¿qué debería hacer primero hoy?".

**Rol de la IA:**
- Recomendaciones de orden basadas en deadlines.
- Resumen del día / semana.

**Aprendizajes implícitos:** qué es persistencia, qué es un usuario logueado, cómo la IA puede operar sobre datos del usuario.

**Nota:** este proyecto **no se conecta directamente** con la promesa de monetización del marco. Entra como balance — no todo tiene que ser para vender. Pero por eso queda último en prioridad.

---

## Resumen de priorización

| # | Proyecto | Pilar de monetización | Complejidad técnica | Costo de IA | Entra en MVP |
|---|---|---|---|---|---|
| 1 | Página para negocio del barrio | Servicios locales | Baja | Bajo | ✅ Sí |
| 2 | Meme generador | Creator economy | Media | Medio | ⬜ v2 |
| 3 | Bot de Telegram | Servicios locales | Media-alta | Medio | ⬜ v2 |
| 4 | Editor de reels | Creator economy | Alta | Alto | ⬜ v3 |
| 5 | Asistente del salón | Ninguno (utilidad personal) | Media | Bajo | ⬜ v2/v3 |

---

## Decisiones todavía abiertas

- ⬜ ¿Confirmar #1 como el proyecto del MVP, o probar con 2 estudiantes reales antes de comprometerse?
- ⬜ ¿El proyecto #2 necesita modelo de imagen propio o se ataja con plantillas + texto generado por Claude?
- ⬜ ¿Hay un proyecto #6 obvio que se está omitiendo? (revisar con un asesor pedagógico cuando exista).
