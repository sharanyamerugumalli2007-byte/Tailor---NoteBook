const authService = require('../services/authService');
const { ok, asyncHandler } = require('../utils/response');

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body.email, req.body.password);
  ok(res, data, 'Login successful');
});

// JWTs are stateless: the client discards its token. Endpoint exists for a consistent API.
const logout = (_req, res) => ok(res, null, 'Logged out');

const me = (req, res) => ok(res, req.user);

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  ok(res, user, 'Profile updated');
});

module.exports = { login, logout, me, updateProfile };
