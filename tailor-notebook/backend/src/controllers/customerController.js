const customerModel = require('../models/customerModel');
const { AppError, ok, created, asyncHandler } = require('../utils/response');

const list = asyncHandler(async (req, res) => ok(res, await customerModel.list(req.validatedQuery)));

const get = asyncHandler(async (req, res) => {
  const c = await customerModel.findById(req.params.id);
  if (!c) throw new AppError('Customer not found', 404);
  ok(res, c);
});

const create = asyncHandler(async (req, res) => created(res, await customerModel.create(req.body), 'Customer created successfully'));

const update = asyncHandler(async (req, res) => {
  const c = await customerModel.update(req.params.id, req.body);
  if (!c) throw new AppError('Customer not found', 404);
  ok(res, c, 'Customer updated successfully');
});

const remove = asyncHandler(async (req, res) => {
  if (!(await customerModel.softDelete(req.params.id))) throw new AppError('Customer not found', 404);
  ok(res, null, 'Customer deleted. Their order history is kept in the records.');
});

const history = asyncHandler(async (req, res) => {
  const c = await customerModel.findById(req.params.id);
  if (!c) throw new AppError('Customer not found', 404);
  ok(res, { customer: c, ...(await customerModel.history(c.id)) });
});

module.exports = { list, get, create, update, remove, history };
