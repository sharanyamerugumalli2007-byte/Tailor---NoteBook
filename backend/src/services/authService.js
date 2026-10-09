const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { signToken } = require('../utils/jwt');
const { AppError } = require('../utils/response');

// Same hash is compared when the email is unknown to keep response timing similar
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  const valid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !valid) throw new AppError('Invalid email or password', 401);
  return {
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

async function updateProfile(userId, { name, email, currentPassword, newPassword }) {
  let passwordHash;
  if (newPassword) {
    const user = await userModel.getWithHash(userId);
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      throw new AppError('Current password is incorrect', 400);
    }
    passwordHash = await bcrypt.hash(newPassword, 10);
  }
  return userModel.update(userId, { name, email, passwordHash });
}

module.exports = { login, updateProfile };
