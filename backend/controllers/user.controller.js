const userService = require('../services/user.service');

async function list(req, res) {
  try {
    const rows = await userService.listUsers();
    res.json(rows);
  } catch (err) {
    console.error('user.list error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function get(req, res) {
  try {
    const row = await userService.getUser(req.params.id);
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  } catch (err) {
    console.error('user.get error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function create(req, res) {
  try {
    const created = await userService.createUser(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error('user.create error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function update(req, res) {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('user.update error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

async function remove(req, res) {
  try {
    await userService.removeUser(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    console.error('user.remove error', err);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  }
}

module.exports = { list, get, create, update, remove };
