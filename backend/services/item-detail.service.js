const model = require('../models/item-detail.model');

const allowedOrderTypes = ['retail','wholesale'];

async function list(filters) {
  return await model.queryAll(filters);
}

async function get(id) {
  return await model.getById(id);
}

async function listByItemName(itemName) {
  return await model.getByItemName(itemName);
}

async function create(detail) {
  const { item_id, type, item_name, item_description, company, size, mrp, purchase_price, selling_price, order_type } = detail;
  if (!item_id || !item_name || !type || !order_type) throw { status: 400, message: 'Required fields missing: item_id, item_name, type, order_type' };
  if (!allowedOrderTypes.includes(order_type)) throw { status: 400, message: 'order_type must be either "retail" or "wholesale"' };
  return await model.createItemDetail(detail);
}

async function update(id, fields) {
  if (fields.order_type !== undefined && !allowedOrderTypes.includes(fields.order_type)) throw { status: 400, message: 'order_type must be either "retail" or "wholesale"' };
  const updated = await model.updateItemDetail(id, fields);
  if (!updated) throw { status: 404, message: 'Not found' };
  return updated;
}

async function remove(id) {
  const ok = await model.deleteItemDetail(id);
  if (!ok) throw { status: 404, message: 'Not found' };
  return true;
}

module.exports = { list, get, listByItemName, create, update, remove };
