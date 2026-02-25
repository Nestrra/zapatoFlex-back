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

## Endpoints disponibles (configuración inicial)

- `GET /` — Información de la API
- `GET /health` — Health check para despliegue y balanceadores

Los módulos (auth, catalog, cart, orders, payments, inventory) se irán añadiendo por fases.

## Estructura del proyecto (actual)

```
zapatoFlex-Back/
├── config/          # Configuración (env, constantes)
├── src/
│   ├── app.js       # Creación de la app Express
│   └── index.js     # Punto de entrada, arranque del servidor
├── .env.example
├── .gitignore
├── package.json
└── README.md
```


MIT
