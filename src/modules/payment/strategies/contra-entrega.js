/**
 * Estrategia de pago: contra entrega (simulado).
 * No llama a pasarela; marca como aprobado para el flujo de checkout.
 */
async function process(_orderId, _amount) {
  return { success: true, status: 'APPROVED' };
}

export default { process };
