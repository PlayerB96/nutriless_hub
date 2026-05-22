# Nutriless Hub — Instrucciones para agentes

Plataforma web para nutricionistas: gestión de alimentos procesados, alimentos orgánicos/tradicionales, recetas y pacientes. Interfaz y mensajes de usuario en **español**.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS 4, Framer Motion, Lucide |
| Auth | NextAuth.js (Credentials + JWT) |
| ORM / DB | Prisma + PostgreSQL |
| Storage | Cloudflare R2 (AWS SDK S3) |
| Otros | react-hot-toast, SweetAlert2, jsPDF |

Alias de imports: `@/*` → `src/*` (ver `tsconfig.json`).

## Estructura del código

```
src/
  app/
    (app)/          # Rutas autenticadas (layout con Navbar, SideNav, tema)
    (auth)/         # Login
    api/            # Route Handlers (REST interno)
  components/
    layout/         # Navbar, Sidenav, Footer
    ui/             # Modal, Tabs, Breadcrumb, MainContent, etc.
  domain/           # Capa de dominio (parcial): entities, models, repositories, usecases
  lib/              # prisma, auth, r2, utils (pdfGenerator)
  shared/hooks/     # Tema (themeProviders, themeToggle)
prisma/
  schema.prisma     # Fuente de verdad del modelo de datos
  migrations/
  seed.ts
```

## Dominio de negocio (Prisma)

- **User**: nutricionista; dueño de alimentos, recetas y pacientes.
- **Food**: alimentos procesados creados por usuario (`NutritionDetail`, `HouseholdMeasure`).
- **TraditionalFood**: catálogo orgánico/tradicional del sistema (nutrientes y medidas caseras propias).
- **Recipe** / **RecipeDetail** / **RecipeIngredient**: recetas con ingredientes ligados a `TraditionalFood`.
- **Patient**: pacientes del nutricionista (`userId` obligatorio).

Antes de cambiar relaciones o campos, revisar `prisma/schema.prisma` y las migraciones existentes. Tras cambios en el esquema:

```bash
npx prisma migrate dev --name descripcion_cambio
npx prisma generate
```

Para reset local con datos de prueba (destructivo):

```bash
npx prisma migrate reset
npx prisma db seed
```

## Rutas y API relevantes

| Área | UI | API |
|------|-----|-----|
| Dashboard | `/dashboard`, `/dashboard/[userId]/...` | — |
| Alimentos procesados | `.../procesados` | `GET/POST /api/users/[id]/foods`, `POST /api/foods`, `POST /api/foods/update` |
| Alimentos orgánicos | `.../organicos` | `/api/users/[id]/foods/organicos` |
| Recetas | `.../recetas`, `.../recetas/[recipeId]/edit` | `/api/recipes`, `/api/recipes/[id]`, `/api/recipes/update` |
| Pacientes | `.../pacientes`, `.../pacientes/[pacienteId]` | `/api/pacientes`, `/api/pacientes/[id]` |
| Auth | `/login` | `/api/auth/[...nextauth]` |

Las páginas del dashboard suelen recibir `userId` en la URL y llamar APIs con `NEXT_PUBLIC_BASE_URL`. Las imágenes usan `NEXT_PUBLIC_IMAGE_BASE_URL`.

## Variables de entorno

No commitear `.env`. Variables usadas en el código:

- `DATABASE_URL` — PostgreSQL
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — sesión NextAuth (JWT)
- `NEXT_PUBLIC_BASE_URL` — origen para fetch desde el cliente
- `NEXT_PUBLIC_IMAGE_BASE_URL` — URL pública de imágenes en R2
- `ALLOWED_ORIGIN` — origen permitido para CORS en APIs (fallback: `NEXTAUTH_URL`)
- `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` — almacenamiento
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — solo para `prisma db seed` (mín. 12 caracteres)

## Seguridad y autenticación

- **Middleware** (`src/middleware.ts`): protege `/dashboard/*`, `/home`, `/settings` y `/api/*` (excepto `/api/auth`). Rate limit en login (10 intentos / 15 min por IP).
- **Cliente** (`AuthGuard`, `useRequireAuth`): layouts en `dashboard/`, `dashboard/[userId]/`, `home/`, `settings/`; valida sesión y que `params.userId` coincida con la sesión.
- **Helpers** (`src/lib/auth-helpers.ts`): `requireSession()`, `requireSessionUser()`, `requirePatientOwned()`, `requireRecipeOwned()`, `requireFoodOwned()`.
- Toda ruta API debe usar estos helpers además del middleware (defensa en profundidad).
- Auth: NextAuth Credentials + JWT en `src/lib/auth.ts` (sin `PrismaAdapter`).

## Comandos

```bash
npm install
npm run dev          # desarrollo en http://localhost:3000
npm run build        # prisma generate + next build
npm run lint         # eslint (next lint)
npm run start        # producción
```

## Convenciones al implementar

### General

- Responder y documentar cambios orientados al usuario en **español**.
- TypeScript estricto; preferir tipos explícitos en APIs y formularios.
- Cambios mínimos y acotados a la tarea; no refactorizar archivos no relacionados.
- Reutilizar componentes en `src/components/ui/` y patrones existentes antes de crear nuevos.
- Leer el archivo y su contexto antes de editar; imitar estilo, nombres e imports del módulo.

### Frontend

- Muchas páginas son `"use client"` con `useSession()` y redirección a `/login` si no hay sesión.
- Estilos con utilidades Tailwind y tokens del tema (`bg-background`, `text-secondary`, `bg-primary`, etc. en `globals.css`).
- Feedback: `react-hot-toast` y/o `sweetalert2`; confirmaciones con `confirmAction.ts` cuando aplique.
- Formularios grandes viven en `components/` del feature (p. ej. `FormularioPaciente`, `FormularioAlimento`).

### API (Route Handlers)

- Ubicación: `src/app/api/**/route.ts`.
- Respuestas con `NextResponse.json()`; errores con `{ error: string }` y códigos HTTP adecuados (400, 404, 500).
- Acceso a datos vía `prisma` desde `@/lib/prisma` (singleton con cache en dev).
- Validar campos requeridos al inicio; mensajes de error en español cuando el resto del endpoint lo hace.
- Subida de imágenes: seguir el patrón de `src/app/api/foods/route.ts` y `src/lib/r2.ts`.

### Autenticación

- Configuración central en `src/lib/auth.ts` (`authOptions`).
- Sesión JWT; `session.user.id` es string (id numérico del usuario como texto).
- En APIs: importar desde `@/lib/auth-helpers` y validar propiedad del recurso.
- No exponer hashes de contraseña ni secretos en respuestas API.

### Capa `domain/`

- Existe de forma incremental (`ValidateUser`, `UserRepository`, modelos TS). No es obligatoria en todas las features; si añades lógica de negocio reutilizable, colócala aquí en lugar de duplicar en componentes.

## Archivos de referencia

- Auth: `src/lib/auth.ts`
- Prisma client: `src/lib/prisma.ts`
- Esquema DB: `prisma/schema.prisma`
- Layout app: `src/app/(app)/layout.tsx`
- Ejemplo API pacientes: `src/app/api/pacientes/route.ts`
- Ejemplo CRUD alimentos + R2: `src/app/api/foods/route.ts`

## Git y entregas

- No crear commits ni push salvo que el usuario lo pida explícitamente.
- No commitear `.env`, credenciales ni claves R2.
- Al proponer PRs, resumir en español con plan de prueba concreto.

## Alcance típico de tareas

1. **Nuevos campos en pacientes/alimentos/recetas**: schema Prisma → migración → API → formulario UI → listados/detalle.
2. **Nuevas pantallas**: ruta bajo `(app)/dashboard/[userId]/...`, protección de sesión, llamadas a API existentes o nuevas.
3. **PDF / reportes**: ver `src/lib/utils/pdfGenerator.ts`.
4. **Imágenes**: subida a R2 (`R2_*` en servidor). En UI usar `getPublicImageUrl()` → proxy `/api/images/[filename]` (same-origin, requiere sesión); no depender de URL pública R2 en el cliente.

## Qué evitar

- Añadir dependencias sin necesidad clara.
- Romper rutas dinámicas `[userId]`, `[recipeId]`, `[pacienteId]` sin actualizar enlaces del dashboard.
- Ejecutar `prisma migrate reset` en producción.
- Mezclar `Food` (usuario) con `TraditionalFood` (catálogo) en relaciones incorrectas.
- Documentación markdown extra (README, etc.) salvo que el usuario la solicite.
