# ZapatoFlex Backend

Backend de la tienda de calzado **ZapatoFlex S.A.S.** Es la API que usa el frontend para usuarios, productos, carrito, pedidos y administración.

---

## Cómo correr el proyecto

### 1. Requisitos

- **Node.js 18 o superior** (recomendado tenerlo instalado con nvm o desde [nodejs.org](https://nodejs.org)).

### 2. Instalar dependencias

En la carpeta del proyecto (`zapatoFlex-Back`):

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus datos (sobre todo la base de datos):

```bash
cp .env.example .env
```

En el `.env` debes tener al menos:

- **Base de datos:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`  
  O una sola variable `DATABASE_URL` con la URL completa de PostgreSQL.
- **JWT:** `JWT_SECRET` (una frase o string secreto para firmar los tokens).
- Opcional: `PORT` (por defecto 4000), `API_PREFIX` (por defecto `/api/v1`).

### 4. Crear las tablas en la base de datos

En PostgreSQL ejecuta los scripts en la carpeta `sql/` en este orden:

1. `001_auth_users_simple.sql` — usuarios (registro y login).
2. `002_catalog_products_inventory.sql` — productos e inventario por talla.
3. `002_catalog_seed.sql` — (opcional) datos de ejemplo.
4. `003_cart_carts_items.sql` — carritos e ítems del carrito.
5. `004_orders_payments.sql` — pedidos, ítems de pedido y pagos.

### 5. Levantar el servidor

- **En desarrollo** (reinicia solo cuando cambies archivos):
  ```bash
  npm run dev
  ```
- **En producción**:
  ```bash
  npm start
  ```

Por defecto la API queda en **http://localhost:4000**. Puedes probar:

- `GET http://localhost:4000/` — información de la API.
- `GET http://localhost:4000/health` — estado del servidor y de la base de datos.

---

## Qué hace este proyecto (funcionalidad)

Es el **backend** de una tienda de zapatos en línea. Se encarga de:

- **Usuarios:** registro, login con correo y contraseña, y perfiles (datos de envío, teléfono). Los usuarios pueden ser clientes o administradores (ADMIN).
- **Productos:** listar productos por categoría (casual, deportivo, formal), ver detalle con tallas y stock. Los precios están en pesos colombianos (COP).
- **Carrito:** cada usuario logueado tiene su carrito; puede agregar productos por talla y cantidad, cambiar cantidades y quitar ítems. Se valida que haya stock.
- **Pedidos y pagos:** el usuario hace checkout desde el carrito; se crea el pedido, se descuenta el inventario y se registra un pago simulado (por ahora solo “contra entrega”). Después el carrito se vacía.
- **Administración (solo ADMIN):**
  - Ver y gestionar **todos los pedidos** (cambiar estado: pendiente, confirmado, enviado, entregado, cancelado, etc.).
  - **Crear y editar productos** (nombre, precio, categoría, imagen, inventario por talla).
  - Eliminar productos de forma lógica (dejan de mostrarse en la tienda).

Todo lo que requiere “estar logueado” usa un **token JWT** que se envía en el header `Authorization: Bearer <token>` después de hacer login.

---

## Servicios y tecnologías usadas

- **Node.js** — entorno de ejecución.
- **Express** — framework para la API REST (rutas, middlewares, JSON).
- **PostgreSQL** — base de datos (usuarios, productos, inventario, carritos, pedidos, pagos). El acceso se hace con el paquete **pg** (pool de conexiones).
- **JWT (jsonwebtoken)** — para sesiones: al hacer login se genera un token que el front (o Postman) envía en cada petición protegida.
- **bcryptjs** — para guardar las contraseñas hasheadas y compararlas en el login (no se guardan en texto plano).
- **dotenv** — para cargar variables de entorno desde un archivo `.env`.
- **cors** — para permitir peticiones desde el frontend en otro dominio o puerto.

La lógica está organizada por **módulos**: auth, catalog, cart, order, payment, admin. En cada uno suele haber **rutas** (controllers), **servicios** (reglas de negocio) y **repositorios** (consultas a la base de datos), para mantener el código ordenado y más fácil de mantener.

---

## Endpoints disponibles (resumen)

| Área        | Método | Ruta                              | Descripción                          |
|------------|--------|------------------------------------|--------------------------------------|
| Global     | GET    | `/`, `/health`                     | Info de la API y estado del servidor |
| Auth       | POST   | `/api/v1/auth/register`            | Registro de usuario                  |
| Auth       | POST   | `/api/v1/auth/login`               | Login (devuelve token)               |
| Auth       | GET    | `/api/v1/auth/me`                  | Perfil actual (con token)            |
| Auth       | PATCH  | `/api/v1/auth/me`                  | Actualizar perfil (dirección, teléfono) |
| Catálogo   | GET    | `/api/v1/products`                 | Listar productos (opcional: ?category=) |
| Catálogo   | GET    | `/api/v1/products/:id`             | Detalle de un producto               |
| Catálogo   | POST   | `/api/v1/products`                 | Crear producto (ADMIN)               |
| Catálogo   | PUT    | `/api/v1/products/:id`             | Actualizar producto (ADMIN)          |
| Catálogo   | DELETE | `/api/v1/products/:id`             | Desactivar producto (ADMIN)          |
| Carrito    | GET    | `/api/v1/cart`                     | Ver mi carrito (con token)           |
| Carrito    | POST   | `/api/v1/cart/items`               | Agregar ítem al carrito              |
| Carrito    | PUT    | `/api/v1/cart/items/:itemId`       | Cambiar cantidad de un ítem          |
| Carrito    | DELETE | `/api/v1/cart/items/:itemId`       | Quitar ítem del carrito              |
| Pedidos    | POST   | `/api/v1/orders/checkout`          | Hacer checkout (carrito → pedido)    |
| Pedidos    | GET    | `/api/v1/orders`                   | Mis pedidos                          |
| Pedidos    | GET    | `/api/v1/orders/:id`               | Detalle de un pedido mío             |
| Admin      | GET    | `/api/v1/admin/orders`             | Todos los pedidos (ADMIN)            |
| Admin      | GET    | `/api/v1/admin/orders/:id`         | Detalle de cualquier pedido (ADMIN)  |
| Admin      | PATCH  | `/api/v1/admin/orders/:id/status`  | Cambiar estado del pedido (ADMIN)    |

Los que piden “token” o “ADMIN” deben llevar en el header:  
`Authorization: Bearer <token>` (el token que devuelve el login).

---

## Despliegue en Vercel

El proyecto está preparado para desplegarse en Vercel (carpeta `api/`, `vercel.json`). Pasos resumidos:

1. Subir el código a un repositorio en GitHub.
2. En Vercel, crear un proyecto nuevo e importar ese repositorio.
3. Si el backend está en una subcarpeta (por ejemplo `zapatoFlex-Back`), en Vercel configurar **Root Directory** en esa carpeta.
4. Añadir las **variables de entorno** (ver abajo para Vercel + Neon).
5. Deploy. Cada push a la rama conectada vuelve a desplegar.

La URL base de la API en producción será la que te asigne Vercel (por ejemplo `https://zapato-flex-back.vercel.app`). El frontend debe usar esa URL para las peticiones en producción.

### Vercel + Neon (base de datos en producción)

Si creaste una base de datos en **Neon** (por ejemplo desde el panel de Vercel o desde [neon.tech](https://neon.tech)), Neon te da varias URLs. Para este backend en Vercel solo necesitas **una**: la que usa el **pooler** (recomendada para serverless).

En **Vercel** → tu proyecto → **Settings** → **Environment Variables** añade:

| Variable       | Valor                                                                 | Entorno   |
|----------------|-----------------------------------------------------------------------|-----------|
| `DATABASE_URL` | La URL que incluye `-pooler` en el host (la que pone "Recommended for most uses"). Ejemplo: `postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require` | Production (y Preview si quieres) |
| `JWT_SECRET`   | Una frase o string secreto que solo tú conozcas (cámbialo en producción) | Production (y Preview) |

- **No hace falta** poner `POSTGRES_URL`, `PGHOST`, etc. El backend solo lee `DATABASE_URL`. Si Neon te dio también `POSTGRES_URL`, puedes usarla como valor de `DATABASE_URL` si es la misma URL con pooler.
- La URL **con** `-pooler` en el host es la recomendada para Vercel (menos conexiones y mejor para serverless).
- **Tablas:** las tablas no se crean solas. Una vez tengas la BD en Neon, debes ejecutar los scripts de la carpeta `sql/` contra esa base (por ejemplo desde el **SQL Editor** de Neon o con `psql` usando la URL sin pooler si lo necesitas para migraciones).

Con eso, en el siguiente deploy el backend usará Neon en producción.

---

## Estructura del proyecto

```
zapatoFlex-Back/
├── api/                    # Punto de entrada para Vercel (serverless)
│   └── index.js
├── config/
│   └── index.js            # Carga de variables de entorno y configuración
├── sql/                    # Scripts para crear tablas (no se suben al repo si está en .gitignore)
│   ├── 001_auth_users_simple.sql
│   ├── 002_catalog_products_inventory.sql
│   ├── 003_cart_carts_items.sql
│   └── 004_orders_payments.sql
├── src/
│   ├── app.js              # Configuración de Express y rutas
│   ├── index.js            # Arranque del servidor
│   ├── db/
│   │   └── client.js       # Conexión a PostgreSQL (pool)
│   ├── middleware/
│   │   └── auth.js         # Verificación de JWT y rol ADMIN
│   └── modules/
│       ├── auth/           # Registro, login, perfil (GET/PATCH /me)
│       ├── catalog/         # Productos e inventario + CRUD admin
│       ├── cart/           # Carrito por usuario
│       ├── order/          # Pedidos y checkout
│       ├── payment/        # Procesamiento de pago (estrategia contra entrega)
│       └── admin/          # Rutas admin: listar/ver/actualizar estado de pedidos
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

Si quieres ampliar algo (por ejemplo más métodos de pago), se añade una nueva estrategia en `src/modules/payment/strategies/` y se registra en el índice de estrategias.
