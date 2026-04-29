# Arquitectura técnica — Maluwa MVP v1

Documento técnico. Complementa `MARCO.md` y `MVP.md`. Define **cómo** se implementa el "diario conversacional" descrito en `MVP.md §2.4`.

> **Principio rector:** v1 corre con el menor número de servicios externos posible. Cada dependencia se justifica o se elimina.

---

## 1. Stack

| Capa | Decisión | Por qué |
|---|---|---|
| **Framework web** | Next.js 15 (App Router) + React 19 | Ya conocido por el autor; SSR + API routes en un solo proyecto |
| **Lenguaje** | TypeScript estricto | Más mantenible que JS plano a 6 meses vista |
| **Estilos** | Tailwind 4 | Velocidad de prototipo; mobile-first nativo |
| **Componentes** | Custom + Radix Primitives donde haga falta | Sin shadcn — overhead innecesario en MVP |
| **Base de datos** | PostgreSQL en DigitalOcean | Coincide con el marco; barata y confiable |
| **ORM** | Drizzle | Liviano, type-safe, sin código mágico |
| **Auth** | Custom email + password con sesiones server-side firmadas | Sin proveedor externo en v1 — datos de menores no salen del backend propio |
| **IA** | Anthropic SDK directo (Claude Haiku 4.5 + Sonnet 4.6) | El marco lo dicta |
| **Hosting de Maluwa** | DigitalOcean App Platform | Coincide con el marco |
| **Hosting de páginas publicadas** | Cloudflare Pages (decisión preliminar) | Free tier hasta ~500 sitios; barato a escala. A revisar contra Vercel |
| **Subdominios** | `*.maluwa.app` apuntando a Cloudflare Pages | Decidir DNS dinámico vía API de Cloudflare |

---

## 2. Modelo de datos (esbozo v1)

```
users (id, email, password_hash, name, age, city, school, parent_email, created_at)
journals (id, user_id, project_type, title, status, published_url, created_at, updated_at)
journal_entries (id, journal_id, kind, role, content_json, created_at)
  kind: 'question' | 'answer' | 'resource' | 'snapshot'
  role: 'ai' | 'student'
project_artifacts (id, journal_id, version, html, css, js, created_at)
ai_usage (id, user_id, model, input_tokens, output_tokens, cost_usd_cents, created_at)
```

`ai_usage` desde el día uno — el costo es el riesgo #1 del marco.

---

## 3. Flujo de una entrada del diario

```
Estudiante escribe respuesta en el feed
        ↓
POST /api/journal/:id/entry  (kind='answer')
        ↓
Server guarda la respuesta
        ↓
Server llama a Claude (Haiku para conversación, Sonnet si toca generar HTML)
        ↓
Server registra ai_usage
        ↓
Server guarda nuevas entries (question + opcional resource + opcional snapshot)
        ↓
Server retorna las nuevas entries al cliente
        ↓
Cliente las añade al feed con animación de aparición
```

Sin streaming en v1 — más simple, latencia aceptable a 2-4s por turno.

---

## 4. Estructura de carpetas

```
maluwa/
├── docs/                        # MARCO, MVP, PROYECTOS, ARCHITECTURE
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (marketing)/         # Landing, /sobre, /privacidad
│   │   ├── (app)/               # Zona autenticada
│   │   │   ├── diario/[id]/     # El diario conversacional
│   │   │   └── proyectos/       # Lista de proyectos del estudiante
│   │   ├── api/
│   │   │   ├── journal/         # Endpoints del diario
│   │   │   └── auth/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── diario/              # Componentes del feed
│   │   ├── preview/             # Sandbox iframe
│   │   └── ui/                  # Botones, inputs, etc.
│   ├── lib/
│   │   ├── ai/                  # Cliente de Claude + prompts
│   │   ├── db/                  # Drizzle schema y queries
│   │   └── auth/
│   └── styles/
├── public/
├── package.json
└── ...
```

---

## 5. Estado del scaffold

- ✅ Next.js + TypeScript + Tailwind configurado.
- ✅ Pantalla del diario funcional con IA stubeada (mock).
- ⬜ Persistencia en Postgres.
- ⬜ Autenticación.
- ⬜ Integración real con Claude.
- ⬜ Sandbox iframe del preview.
- ⬜ Publicación en Cloudflare Pages.

---

## 6. Decisiones técnicas pendientes

- ⬜ ¿Streaming de respuestas IA en v1 o v2? (impacta UX percibido).
- ⬜ ¿Cómo se aísla el HTML/JS generado en el preview para que un estudiante no se rompa la sesión por accidente? (sandbox iframe + CSP).
- ⬜ ¿Drizzle migra automáticamente en deploy o se gatilla a mano? (depende de Riesgo #2 de privacidad).
- ⬜ ¿Cloudflare Pages o Vercel para sitios publicados? (decidir cuando se sepa el costo a 1000 sitios).
