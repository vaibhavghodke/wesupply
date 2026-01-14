const model = require('../models/order-summary.model');

const validStatuses = ['pending', 'Open', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

async function list(filters) {
  return await model.queryAll(filters);
}

async function get(id) {
  return await model.getById(id);
}

async function create(order) {
  if (!order.order_summary || !order.contact) throw { status: 400, message: 'order_summary and contact are required' };
  const status = order.status && validStatuses.includes(order.status) ? order.status : 'pending';
  return await model.createOrder({ ...order, status });
}

async function update(id, fields) {
  if (fields.status !== undefined && !validStatuses.includes(fields.status)) throw { status: 400, message: `status must be one of: ${validStatuses.join(', ')}` };
  const updated = await model.updateOrder(id, fields);
  if (!updated) throw { status: 404, message: 'Order not found' };
  return updated;
}

async function remove(id) {
  const ok = await model.deleteOrder(id);
  if (!ok) throw { status: 404, message: 'Order not found' };
  return true;
}

async function listByStatus(status) {
  if (!validStatuses.includes(status)) throw { status: 400, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
  return await model.listByStatus(status);
}

module.exports = { list, get, create, update, remove, listByStatus };
