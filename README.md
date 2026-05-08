# maluwa

Plataforma educativa abierta que enseña a adolescentes hispanohablantes (12-17) a crear páginas web y aplicaciones con IA, con el foco puesto en que se sientan capaces de generar servicios digitales monetizables en sus propias comunidades.

**Sitio:** [maluwa.app](https://maluwa.app) (próximamente)

## ¿Qué es esto?

Una herramienta gratuita y open-source pensada para pelados de bachillerato de estratos bajos en Colombia. La idea no es enseñar "informática" como materia escolar — es darles las llaves para que construyan cosas reales con IA y, si quieren, les saquen plata.

- **Tronco común corto** de fundamentos.
- **Bifurcaciones por proyecto** elegidas por el estudiante.
- **Tutor IA integrado** que acompaña en cada paso.
- **Voz cómplice**, no académica.

## Variables de entorno

Para correr el proyecto en local, `.env.local` debe tener al menos:

```
DATABASE_URL=postgres://...           # Postgres (DigitalOcean en prod)
ANTHROPIC_API_KEY=sk-ant-...          # Claude (tutor del diario)
RESEND_API_KEY=re_...                 # Email transaccional al padre
MALUWA_FROM_EMAIL=noreply@maluwa.app  # Remitente verificado en Resend
AUTH_SECRET=...                       # HMAC para cookie de login (32+ bytes)
```

Para generar `AUTH_SECRET`:

```sh
openssl rand -base64 32
```

Cualquier string aleatorio largo sirve. Si está vacío, los endpoints de
auth (`/api/auth/login`, `/api/auth/logout`) y la lectura de la cookie
de sesión fallan con error explícito. El build de Next no lo lee en
module load, así que `next build` pasa sin esta variable seteada.

## Estado

🚧 En diseño. Sin código todavía.

- Marco estratégico: [docs/MARCO.md](docs/MARCO.md)
- Alcance del MVP v1: [docs/MVP.md](docs/MVP.md)
- Proyectos del currículo de bifurcación: [docs/PROYECTOS.md](docs/PROYECTOS.md)

## Licencia

[MIT](LICENSE)
