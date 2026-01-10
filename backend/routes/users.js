const express = require('express');
const router = express.Router();
const db = require('../db');
const allowedRoles = ['user', 'admin'];

// List users
router.get('/', (req, res) => {
  db.all('SELECT * FROM users ORDER BY created_date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get user by id
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

// Create user with uniqueness validation for userid and email
router.post('/', (req, res) => {
  const { firstname, lastname, userid, password, email, primary_phone, secondary_phone, address, city, role, created_by } = req.body;

  if (!userid || !password) return res.status(400).json({ error: 'userid and password are required' });
  if (role && !allowedRoles.includes(role)) return res.status(400).json({ error: `role must be one of: ${allowedRoles.join(', ')}` });

  // Check userid
  db.get('SELECT id FROM users WHERE userid = ?', [userid], (uErr, uRow) => {
    if (uErr) return res.status(500).json({ error: uErr.message });
    if (uRow) return res.status(409).json({ error: 'userid already exists' });

    // Check email if provided
    if (email) {
      db.get('SELECT id FROM users WHERE email = ?', [email], (eErr, eRow) => {
        if (eErr) return res.status(500).json({ error: eErr.message });
        if (eRow) return res.status(409).json({ error: 'email already exists' });
        insertUser();
      });
    } else {
      insertUser();
    }
  });

  function insertUser() {
    const userRole = role || 'user';
    const stmt = db.prepare(`INSERT INTO users (firstname, lastname, userid, password, email, primary_phone, secondary_phone, address, city, role, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(firstname || null, lastname || null, userid, password, email || null, primary_phone || null, secondary_phone || null, address || null, city || null, userRole, created_by || null, function(err) {
      if (err) {
        stmt.finalize();
        return res.status(500).json({ error: err.message });
      }
      const newId = this.lastID;
      // Ensure role is set (fix for any legacy schema mismatch) then return row
      db.run("UPDATE users SET role = ? WHERE id = ? AND (role IS NULL OR role = '')", [userRole, newId], (uErr) => {
        if (uErr) console.error('Failed to set default role for new user:', uErr.message);
        db.get('SELECT * FROM users WHERE id = ?', [newId], (gErr, row) => {
          if (gErr) return res.status(500).json({ error: gErr.message });
          res.status(201).json(row);
        });
      });
      stmt.finalize();
    });
  }
});

// Update user with uniqueness validation
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { firstname, lastname, userid, password, email, role, primary_phone, secondary_phone, address, city, updated_by } = req.body;
  if (role !== undefined && role !== null && !allowedRoles.includes(role)) return res.status(400).json({ error: `role must be one of: ${allowedRoles.join(', ')}` });

  // Validate userid uniqueness
  if (userid) {
    db.get('SELECT id FROM users WHERE userid = ? AND id != ?', [userid, id], (uErr, uRow) => {
      if (uErr) return res.status(500).json({ error: uErr.message });
      if (uRow) return res.status(409).json({ error: 'userid already exists' });
      checkEmailAndUpdate();
    });
  } else {
    checkEmailAndUpdate();
  }

  function checkEmailAndUpdate() {
    if (email) {
      db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id], (eErr, eRow) => {
        if (eErr) return res.status(500).json({ error: eErr.message });
        if (eRow) return res.status(409).json({ error: 'email already exists' });
        doUpdate();
      });
    } else {
      doUpdate();
    }
  }

  function doUpdate() {
    // Build updates excluding role; handle role update separately to avoid parameter ordering issues
    const updates = [];
    const params = [];
    let roleToUpdate = undefined;
    if (firstname !== undefined) { updates.push('firstname = ?'); params.push(firstname); }
    if (lastname !== undefined) { updates.push('lastname = ?'); params.push(lastname); }
    if (userid !== undefined) { updates.push('userid = ?'); params.push(userid); }
    if (password !== undefined) { updates.push('password = ?'); params.push(password); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (role !== undefined) { roleToUpdate = role; }
    if (primary_phone !== undefined) { updates.push('primary_phone = ?'); params.push(primary_phone); }
    if (secondary_phone !== undefined) { updates.push('secondary_phone = ?'); params.push(secondary_phone); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (city !== undefined) { updates.push('city = ?'); params.push(city); }
    if (updated_by !== undefined) { updates.push('updated_by = ?'); params.push(updated_by); }
    updates.push('updated_date = CURRENT_TIMESTAMP');

    // Helper to fetch and return final row
    function returnRow() {
      db.get('SELECT * FROM users WHERE id = ?', [id], (gErr, row) => {
        if (gErr) return res.status(500).json({ error: gErr.message });
        res.json(row);
      });
    }

    // If nothing to update except possibly role, handle accordingly
    if (updates.length === 1 && roleToUpdate === undefined) {
      // only updated_date present (no changes)
      return res.status(400).json({ error: 'No fields to update' });
    }

    // First, if roleToUpdate is provided, update it
    const runMainUpdate = () => {
      if (updates.length > 0) {
        params.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        console.log('User update SQL:', sql, 'params:', params);
        db.run(sql, params, function(err) {
          if (err) return res.status(500).json({ error: err.message });
          if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
          returnRow();
        });
      } else {
        // only role was intended to update
        returnRow();
      }
    };

    if (roleToUpdate !== undefined) {
      db.run('UPDATE users SET role = ?, updated_date = CURRENT_TIMESTAMP WHERE id = ?', [roleToUpdate, id], function(rErr) {
        if (rErr) return res.status(500).json({ error: rErr.message });
        // proceed to other updates
        runMainUpdate();
      });
    } else {
      runMainUpdate();
    }
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ deleted: true });
  });
});

module.exports = router;
