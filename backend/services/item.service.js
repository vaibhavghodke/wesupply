const itemModel = require('../models/item.model');

async function listItems() {
  return await itemModel.allItems();
}

async function getItem(id) {
  return await itemModel.getById(id);
}

async function createItem(item) {
  if (!item.name || !item.description || !item.image || !item.stock) throw { status: 400, message: 'name, description, image and stock are required' };
  const created = await itemModel.createItem(item);
  return created;
}

async function updateItem(id, item) {
  if (!item.name || !item.description || !item.image || !item.stock) throw { status: 400, message: 'name, description, image and stock are required' };
  const updated = await itemModel.updateItem(id, item);
  if (!updated) throw { status: 404, message: 'Not found' };
  return updated;
}

async function removeItem(id) {
  const ok = await itemModel.deleteItem(id);
  if (!ok) throw { status: 404, message: 'Not found' };
  return true;
}

module.exports = { listItems, getItem, createItem, updateItem, removeItem };
