const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../services/user.service');
const userModel = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'ws_token';

router.post('/login', async (req, res, next) => {
  try {
    const { userid, password } = req.body || {};
    if (!userid || !password) return res.status(400).json({ error: 'userid and password required' });

    const user = await userModel.getByUserid(userid);
    if (!user) {
      if (process.env.NODE_ENV !== 'production') console.warn(`auth: login failed - userid not found: ${userid}`);
      return res.status(401).json({ error: 'invalid credentials' });
    }
    // ensure password hash exists
    if (!user.password) {
      if (process.env.NODE_ENV !== 'production') console.warn(`auth: user has no password hash - userid: ${userid}`);
      return res.status(401).json({ error: 'invalid credentials' });
    }

    let pwMatches = false;
    try {
      pwMatches = await bcrypt.compare(password, user.password);
    } catch (e) {
      pwMatches = false;
    }

    // If bcrypt compare fails, handle possible legacy plaintext password
    if (!pwMatches) {
      // legacy plaintext stored password migration: if stored value equals raw password,
      // re-hash and update the user record, then allow login.
      if (user.password === password) {
        if (process.env.NODE_ENV !== 'production') console.warn(`auth: migrating plaintext password for userid: ${userid}`);
        const newHash = await bcrypt.hash(password, 10);
        try {
          await userModel.updateUser(user.id, { password: newHash });
          pwMatches = true;
        } catch (uErr) {
          if (process.env.NODE_ENV !== 'production') console.warn('auth: failed to update migrated password', uErr && uErr.message);
        }
      }
    }

    if (!pwMatches) {
      if (process.env.NODE_ENV !== 'production') console.warn(`auth: invalid password for userid: ${userid}`);
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const payload = { id: user.id, userid: user.userid, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (!token) return res.status(200).json({ user: null });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.getById(decoded.id);
    if (!user) return res.status(200).json({ user: null });
    // strip password
    delete user.password;
    res.json({ user });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});

module.exports = router;
