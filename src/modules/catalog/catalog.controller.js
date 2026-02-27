import catalogService from './catalog.service.js';

/**
 * GET /api/v1/products
 * Query: category (opcional) = casual | deportivo | formal
 */
function list(req, res) {
  const category = req.query.category;

  catalogService
    .listProducts({ category })
    .then((products) => res.json({ products }))
    .catch((err) => {
      console.error('[Catalog] list error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * GET /api/v1/products/:id
 */
function getById(req, res) {
  const { id } = req.params;

  catalogService
    .getProductById(id)
    .then((product) => {
      if (!product) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
      res.json(product);
    })
    .catch((err) => {
      console.error('[Catalog] getById error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * POST /api/v1/products (ADMIN)
 * Body: { name, description, price, category, imageUrl?, inventory: [ { size, quantity }, ... ] }
 */
function create(req, res) {
  const { name, description, price, category, imageUrl, inventory } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'NAME_AND_PRICE_REQUIRED' });
  }
  if (!['casual', 'deportivo', 'formal'].includes(String(category).toLowerCase())) {
    return res.status(400).json({ error: 'INVALID_CATEGORY' });
  }

  catalogService
    .createProduct({ name, description, price, category, imageUrl, inventory })
    .then((product) => res.status(201).json(product))
    .catch((err) => {
      console.error('[Catalog] create error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * PUT /api/v1/products/:id (ADMIN)
 * Body: { name?, description?, price?, category?, imageUrl?, active?, inventory?: [ { size, quantity }, ... ] }
 * Si se envía inventory, reemplaza todas las tallas del producto.
 */
function update(req, res) {
  const { id } = req.params;
  const { name, description, price, category, imageUrl, active, inventory } = req.body;

  catalogService
    .updateProduct(id, { name, description, price, category, imageUrl, active, inventory })
    .then((product) => {
      if (!product) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
      res.json(product);
    })
    .catch((err) => {
      console.error('[Catalog] update error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * DELETE /api/v1/products/:id (ADMIN)
 * Eliminación lógica (active = false).
 */
function remove(req, res) {
  const { id } = req.params;

  catalogService
    .deleteProduct(id)
    .then((product) => {
      if (!product) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
      res.json({ success: true, message: 'Product deactivated' });
    })
    .catch((err) => {
      console.error('[Catalog] delete error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

export default {
  list,
  getById,
  create,
  update,
  remove,
};
