const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const allowedRoles = ['user', 'admin'];

async function listUsers() {
  return await userModel.allUsers();
}

async function getUser(id) {
  return await userModel.getById(id);
}

async function createUser(user) {
  if (!user.userid || !user.password) throw { status: 400, message: 'userid and password are required' };
  if (user.role && !allowedRoles.includes(user.role)) throw { status: 400, message: `role must be one of: ${allowedRoles.join(', ')}` };

  const existingByUserid = await userModel.getByUserid(user.userid);
  if (existingByUserid) throw { status: 409, message: 'userid already exists' };
  if (user.email) {
    const existingByEmail = await userModel.getByEmail(user.email);
    if (existingByEmail) throw { status: 409, message: 'email already exists' };
  }

  // Hash password before storing
  const hashed = await bcrypt.hash(user.password, 10);
  user.password = hashed;
  const created = await userModel.createUser(user);
  return created;
}

async function updateUser(id, fields) {
  if (fields.role !== undefined && !allowedRoles.includes(fields.role)) throw { status: 400, message: `role must be one of: ${allowedRoles.join(', ')}` };

  if (fields.userid) {
    const existing = await userModel.getByUserid(fields.userid);
    if (existing && String(existing.id) !== String(id)) throw { status: 409, message: 'userid already exists' };
  }
  if (fields.email) {
    const existingE = await userModel.getByEmail(fields.email);
    if (existingE && String(existingE.id) !== String(id)) throw { status: 409, message: 'email already exists' };
  }

  const updated = await userModel.updateUser(id, fields);
  if (!updated) throw { status: 404, message: 'User not found' };
  return updated;
}

async function removeUser(id) {
  const ok = await userModel.deleteUser(id);
  if (!ok) throw { status: 404, message: 'User not found' };
  return true;
}

module.exports = { listUsers, getUser, createUser, updateUser, removeUser };
