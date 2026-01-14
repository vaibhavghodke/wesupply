const itemService = require('../services/item.service');

async function list(req, res) {
  try {
    const rows = await itemService.listItems();
    res.json(rows);
  } catch (err) {
    console.error('item.list error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function get(req, res) {
  try {
    const row = await itemService.getItem(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('item.get error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function create(req, res) {
  try {
    const created = await itemService.createItem(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error('item.create error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function update(req, res) {
  try {
    const updated = await itemService.updateItem(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('item.update error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function remove(req, res) {
  try {
    await itemService.removeItem(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    console.error('item.remove error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

module.exports = { list, get, create, update, remove };
