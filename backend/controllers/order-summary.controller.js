const service = require('../services/order-summary.service');

async function list(req, res) {
  try {
    const filters = { status: req.query.status, created_by: req.query.created_by, start_date: req.query.start_date, end_date: req.query.end_date };
    const rows = await service.list(filters);
    res.json(rows);
  } catch (err) {
    console.error('order.list error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function get(req, res) {
  try {
    const row = await service.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Order not found' });
    res.json(row);
  } catch (err) {
    console.error('order.get error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function create(req, res) {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error('order.create error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function update(req, res) {
  try {
    await service.update(req.params.id, req.body);
    res.json({ message: 'Order updated successfully', order_id: req.params.id });
  } catch (err) {
    console.error('order.update error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id);
    res.json({ deleted: true, order_id: req.params.id });
  } catch (err) {
    console.error('order.remove error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function listByStatus(req, res) {
  try {
    const rows = await service.listByStatus(req.params.status);
    res.json(rows);
  } catch (err) {
    console.error('order.listByStatus error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

module.exports = { list, get, create, update, remove, listByStatus };
