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
  Respuesta 200: `{ "success": true, "user": { ... }, "token": "<JWT>" }`  
  El **token** se usa en el header `Authorization: Bearer <token>` para rutas que exigen rol ADMIN.

Requiere PostgreSQL configurado (variables `DB_*` o `DATABASE_URL`) y la tabla `users` creada (ver `sql/001_auth_users_simple.sql`).

### Catálogo (productos e inventario)

Todos los precios están en **pesos colombianos (COP)**. Las respuestas incluyen `"currency": "COP"` en cada producto.

- `GET /api/v1/products` — Lista productos activos con stock (solo productos que tengan al menos una talla con cantidad > 0).  
  Query: `?category=casual` | `?category=deportivo` | `?category=formal` (opcional).  
  Respuesta 200: `{ "products": [ { "id", "name", "description", "price", "currency": "COP", "category", "imageUrl", ... } ] }`
- `GET /api/v1/products/:id` — Detalle de un producto con inventario por talla.  
  Respuesta 200: `{ "id", "name", "description", "price", "currency": "COP", "category", "imageUrl", "inventory": [ { "size", "quantity" }, ... ] }`  
  404 si no existe o está inactivo.

Requiere tablas `products` e `inventory` (ver `sql/002_catalog_products_inventory.sql`). Categorías para filtro: **casual**, **deportivo**, **formal**.

#### CRUD productos (solo rol ADMIN)

Todas estas rutas requieren header **`Authorization: Bearer <token>`** con el JWT obtenido al hacer login como usuario ADMIN.

- **Crear producto (y tallas)**  
  `POST /api/v1/products`  
  Body: `{ "name", "description", "price", "category", "imageUrl?", "inventory": [ { "size": "38", "quantity": 10 }, ... ] }`  
  **price** en pesos colombianos (COP).  
  `category`: `casual` | `deportivo` | `formal`.  
  `inventory`: array de talla y cantidad; si se omite, el producto queda sin stock hasta que se actualice.

- **Actualizar producto**  
  `PUT /api/v1/products/:id`  
  Body (todos opcionales): `{ "name?", "description?", "price?", "category?", "imageUrl?", "active?", "inventory?": [ { "size", "quantity" }, ... ] }`  
  Si se envía **inventory**, se **reemplazan** todas las tallas del producto.

- **Eliminar producto (baja lógica)**  
  `DELETE /api/v1/products/:id`  
  Pone `active = false`; el producto deja de aparecer en el listado público.

**Tallas:** se gestionan con el array `inventory`: cada elemento es `{ "size": "36"|"37"|...|"42"|"M"|"L"|..., "quantity": number }`. En creación se envían todas las tallas deseadas; en actualización, si se envía `inventory`, se sustituye por completo el inventario de ese producto.

### Carrito (requiere Auth)

Todas las rutas exigen **`Authorization: Bearer <token>`** (usuario logueado, no necesariamente ADMIN). Precios en COP.

- `GET /api/v1/cart` — Obtiene el carrito del usuario con ítems (productName, size, quantity, unitPrice, subtotal) y subtotal total.
- `POST /api/v1/cart/items` — Añade un ítem. Body: `{ "productId", "size", "quantity" }`. Valida stock; si el mismo producto+talla ya está en el carrito, suma la cantidad.
- `PUT /api/v1/cart/items/:itemId` — Actualiza la cantidad de un ítem. Body: `{ "quantity" }`. Valida stock.
- `DELETE /api/v1/cart/items/:itemId` — Elimina un ítem del carrito.

Requiere tablas `carts` y `cart_items` (ver `sql/003_cart_carts_items.sql`).

### Pedidos y pagos (checkout)

Todas las rutas exigen **`Authorization: Bearer <token>`**. Por ahora el pago es **simulado** con una sola opción: **contra entrega**. La estructura de pagos está preparada para añadir después una pasarela (Strategy).

- `POST /api/v1/orders/checkout` — Checkout: convierte el carrito en pedido, registra pago (simulado) y vacía el carrito.  
  Body: `{ "shippingAddress"? (opcional), "paymentMethod": "CONTRA_ENTREGA" }`.  
  Respuesta 201: pedido con `items` y `payment` (amount, paymentMethod, status).  
  Errores: 400 CART_EMPTY, INSUFFICIENT_STOCK, UNSUPPORTED_PAYMENT_METHOD; 402 PAYMENT_FAILED.

- `GET /api/v1/orders` — Lista los pedidos del usuario.

- `GET /api/v1/orders/:id` — Detalle de un pedido (solo si pertenece al usuario), con `payment`.

Requiere tablas `orders`, `order_items` y `payments` (ver `sql/004_orders_payments.sql`). Para añadir más métodos de pago más adelante, se agrega una nueva estrategia en `src/modules/payment/strategies/` y se registra en `strategies/index.js`.

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
│   │   └── catalog/                 # Módulo catálogo
│   │       ├── catalog.controller.js
│   │       ├── catalog.repository.js
│   │       ├── catalog.routes.js
│   │       └── catalog.service.js
│   ├── app.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── vercel.json          # Configuración Vercel (rewrites, build)
└── README.md
```

