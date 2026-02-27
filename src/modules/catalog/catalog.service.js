import catalogRepository from './catalog.repository.js';

/**
 * Servicio de catálogo: listar y ver detalle de productos.
 * Solo productos con stock disponible (al menos una talla con cantidad > 0).
 */
async function listProducts({ category } = {}) {
  return catalogRepository.findAll({ category });
}

async function getProductById(id) {
  return catalogRepository.findById(id);
}

/**
 * Para admin: obtener producto por id incluyendo inactivos.
 */
async function getProductByIdForAdmin(id) {
  return catalogRepository.findById(id, { includeInactive: true });
}

async function createProduct(data) {
  const { inventory, ...product } = data;
  return catalogRepository.create(product, inventory);
}

async function updateProduct(id, data) {
  const inventory = data.inventory !== undefined ? data.inventory : null;
  const { inventory: _inv, ...fields } = data;
  return catalogRepository.update(id, fields, inventory);
}

async function deleteProduct(id) {
  return catalogRepository.remove(id);
}

export default {
  listProducts,
  getProductById,
  getProductByIdForAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};
