const service = require('../services/item-detail.service');

async function list(req, res) {
  try {
    const filters = {
      item_id: req.query.item_id,
      item_name: req.query.item_name,
      type: req.query.type,
      company: req.query.company,
      order_type: req.query.order_type
    };
    let rows = await service.list(filters);
    // If caller provided item_name but we found no rows, also try matching by `type`
    if ((filters && filters.item_name) && Array.isArray(rows) && rows.length === 0) {
      const altFilters = Object.assign({}, filters);
      delete altFilters.item_name;
      altFilters.type = filters.item_name;
      rows = await service.list(altFilters);
    }
    // Prevent clients from using stale cached responses (avoid 304 empty bodies in UI)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    // Clear any ETag for this response so browsers won't send conditional If-None-Match
    res.set('ETag', '');
    res.json(rows);
  } catch (err) {
    console.error('item-detail.list error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function get(req, res) {
  try {
    const row = await service.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('item-detail.get error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function listByItemName(req, res) {
  try {
    const rows = await service.listByItemName(req.params.itemName);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    res.set('ETag', '');
    res.json(rows);
  } catch (err) {
    console.error('item-detail.listByItemName error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function create(req, res) {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error('item-detail.create error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function update(req, res) {
  try {
    const updated = await service.update(req.params.id, req.body);
    res.json({ message: 'Updated successfully', item_detail_id: req.params.id });
  } catch (err) {
    console.error('item-detail.update error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id);
    res.json({ deleted: true, item_detail_id: req.params.id });
  } catch (err) {
    console.error('item-detail.remove error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

module.exports = { list, get, listByItemName, create, update, remove };
