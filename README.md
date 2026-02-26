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

### Auth (módulo actual – sin BD, en memoria)
- `POST /api/v1/auth/register` — Registro de usuario  
  Body: `{ "email", "password", "firstName?", "lastName?" }`  
  Respuesta 201: `{ "success": true, "user": { "id", "email", "firstName", "lastName", "role", "createdAt" } }`
- `POST /api/v1/auth/login` — Inicio de sesión  
  Body: `{ "email", "password" }`  
  Respuesta 200: `{ "success": true, "user": { "id", "email", "firstName", "lastName", "role" } }`

Los datos de usuarios se mantienen en memoria (se pierden al reiniciar). La persistencia con BD se añadirá en el siguiente paso.

## Estructura del proyecto (actual)

```
zapatoFlex-Back/
├── config/              # Configuración (env, constantes)
├── src/
│   ├── modules/
│   │   └── auth/        # Módulo de autenticación
│   │       ├── auth.controller.js
│   │       ├── auth.routes.js
│   │       └── auth.service.js
│   ├── app.js           # Creación de la app Express
│   └── index.js         # Punto de entrada
├── .env.example
├── .gitignore
├── package.json
└── README.md
```


MIT
