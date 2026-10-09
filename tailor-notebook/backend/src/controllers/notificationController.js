const notificationModel = require('../models/notificationModel');
const { AppError, ok, asyncHandler } = require('../utils/response');

const list = asyncHandler(async (req, res) => ok(res, await notificationModel.listForUser(req.user.id)));

const markRead = asyncHandler(async (req, res) => {
  if (!(await notificationModel.markRead(req.params.id, req.user.id))) throw new AppError('Notification not found', 404);
  ok(res, null, 'Marked as read');
});

const markAllRead = asyncHandler(async (req, res) => {
  const n = await notificationModel.markAllRead(req.user.id);
  ok(res, { updated: n }, 'All notifications marked as read');
});

module.exports = { list, markRead, markAllRead };
