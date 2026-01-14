const db = require('../db');

function allItems() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM items', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function createItem(item) {
  const { name, description, image, stock } = item;
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO items (name, description, image, stock) VALUES (?, ?, ?, ?)');
    stmt.run(name, description || null, image || null, stock || null, function(err) {
      stmt.finalize();
      if (err) return reject(err);
      resolve({ id: this.lastID, name, description: description || null, image: image || null, stock: stock || null });
    });
  });
}

function updateItem(id, item) {
  const { name, description, image, stock } = item;
  return new Promise((resolve, reject) => {
    db.run('UPDATE items SET name = ?, description = ?, image = ?, stock = ? WHERE id = ?', [name, description || null, image || null, stock || null, id], function(err) {
      if (err) return reject(err);
      if (this.changes === 0) return resolve(null);
      resolve({ id, name, description: description || null, image: image || null, stock: stock || null });
    });
  });
}

function deleteItem(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

module.exports = { allItems, getById, createItem, updateItem, deleteItem };
