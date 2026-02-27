# ZapatoFlex Backend

API REST del backend de la plataforma ZapatoFlex S.A.S. (venta de calzado en línea).

## Requisitos

- Node.js >= 18

## Instalación

```bash
npm install
```

## Configuración

Copia el archivo de ejemplo y ajusta los valores si es necesario:

```bash
cp .env.example .env
```

Variables principales:

| Variable      | Descripción           | Por defecto   |
|---------------|-----------------------|---------------|
| `PORT`        | Puerto del servidor   | `4000`        |
| `NODE_ENV`    | Entorno (development/production) | `development` |
| `API_PREFIX`  | Prefijo de la API     | `/api/v1`     |
| `DB_HOST`     | Host de PostgreSQL    | `localhost`   |
| `DB_PORT`     | Puerto de PostgreSQL | `5432`        |
| `DB_USER`     | Usuario de la BD     | —             |
| `DB_PASSWORD` | Contraseña de la BD  | —             |
| `DB_NAME`     | Nombre de la base    | —             |

## Ejecución

- **Desarrollo** (reinicio automático al cambiar archivos):
  ```bash
  npm run dev
  ```
- **Producción**:
  ```bash
  npm start
  ```

## Endpoints disponibles

### Globales
- `GET /` — Información de la API
- `GET /health` — Health check para despliegue y balanceadores

### Auth (con persistencia en PostgreSQL)
- `POST /api/v1/auth/register` — Registro de usuario  
  Body: `{ "email", "password", "firstName?", "lastName?" }`  
  Respuesta 201: `{ "success": true, "user": { "id", "email", "firstName", "lastName", "role", "createdAt", ... } }`
- `POST /api/v1/auth/login` — Inicio de sesión  
  Body: `{ "email", "password" }`  
  Respuesta 200: `{ "success": true, "user": { "id", "email", "firstName", "lastName", "role", ... } }`

Requiere PostgreSQL configurado (variables `DB_*` o `DATABASE_URL`) y la tabla `users` creada (ver `sql/001_auth_users_simple.sql`).

## Despliegue en Vercel (con GitHub)

El proyecto está preparado para desplegarse en Vercel como función serverless.

### 1. Subir el código a GitHub

- Crea un repositorio en GitHub (por ejemplo `zapatoflex-back` o el monorepo con la carpeta `zapatoFlex-Back`).
- Si el backend está en una **carpeta** dentro del repo (ej. `Actividad2Unidad1/zapatoFlex-Back`), anótalo; en Vercel deberás indicar esa carpeta como **Root Directory**.

### 2. Conectar el proyecto en Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (con tu cuenta de GitHub).
2. **Add New** → **Project**.
3. **Import Git Repository**: elige el repositorio donde está el backend.
4. **Configure Project**:
   - **Root Directory:** si el backend está en una subcarpeta (ej. `zapatoFlex-Back`), haz clic en **Edit** y selecciona esa carpeta.
   - **Framework Preset:** Other (o None).
   - **Build Command:** vacío (o `npm run build` si más adelante añades un script de build).
   - **Output Directory:** vacío.
   - **Install Command:** `npm install`.
5. **Environment Variables (opcional):** si usas variables (p. ej. `API_PREFIX`), añádelas en **Environment Variables** (Name / Value). En Vercel no hace falta `PORT`.
6. Pulsa **Deploy**.

### 3. Después del despliegue

- Vercel te dará una URL como `https://zapatoflex-back-xxx.vercel.app`.
- Prueba:
  - `GET https://tu-url.vercel.app/` — info de la API.
  - `GET https://tu-url.vercel.app/health` — health check.
  - `POST https://tu-url.vercel.app/api/v1/auth/register` — registro (Body JSON como en local).

Cada **push** a la rama conectada (p. ej. `main`) generará un nuevo despliegue automático.

### Nota

En Vercel el backend corre como **serverless**. Para que Auth funcione en producción, configura en el proyecto las variables de base de datos (`DATABASE_URL` o `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) con una BD accesible desde internet (p. ej. Vercel Postgres, Neon, Railway, etc.).

## Estructura del proyecto (actual)

```
zapatoFlex-Back/
├── api/                 # Entrada serverless para Vercel
│   └── index.js
├── config/
├── src/
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.js
│   │       ├── auth.repository.js   # Acceso a BD (tabla users)
│   │       ├── auth.routes.js
│   │       └── auth.service.js
│   ├── app.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── vercel.json          # Configuración Vercel (rewrites, build)
└── README.md
```


MIT
