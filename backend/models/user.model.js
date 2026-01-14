const db = require('../db');

function allUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users ORDER BY created_date DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function getByUserid(userid) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE userid = ?', [userid], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function getByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function createUser(user) {
  const { firstname, lastname, userid, password, email, primary_phone, secondary_phone, address, city, role, created_by } = user;
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO users (firstname, lastname, userid, password, email, primary_phone, secondary_phone, address, city, role, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(firstname || null, lastname || null, userid, password, email || null, primary_phone || null, secondary_phone || null, address || null, city || null, role || 'user', created_by || null, function(err) {
      stmt.finalize();
      if (err) return reject(err);
      const newId = this.lastID;
      // ensure role set
      db.run('UPDATE users SET role = ? WHERE id = ? AND (role IS NULL OR role = "")', [role || 'user', newId], (uErr) => {
        if (uErr) console.error('Failed to set default role for new user:', uErr.message);
        getById(newId).then(resolve).catch(reject);
      });
    });
  });
}

function updateUser(id, fields) {
  return new Promise((resolve, reject) => {
    const updates = [];
    const params = [];
    Object.keys(fields).forEach(k => {
      if (k === 'id') return;
      if (k === 'role') return; // role handled separately
      updates.push(`${k} = ?`);
      params.push(fields[k]);
    });
    updates.push('updated_date = CURRENT_TIMESTAMP');

    const runMainUpdate = () => {
      if (updates.length > 0) {
        params.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        db.run(sql, params, function(err) {
          if (err) return reject(err);
          if (this.changes === 0) return reject({ code: 'NOT_FOUND' });
          getById(id).then(resolve).catch(reject);
        });
      } else {
        getById(id).then(resolve).catch(reject);
      }
    };

    if (fields.role !== undefined) {
      db.run('UPDATE users SET role = ?, updated_date = CURRENT_TIMESTAMP WHERE id = ?', [fields.role, id], function(rErr) {
        if (rErr) return reject(rErr);
        runMainUpdate();
      });
    } else {
      runMainUpdate();
    }
  });
}

function deleteUser(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

module.exports = { allUsers, getById, getByUserid, getByEmail, createUser, updateUser, deleteUser };
