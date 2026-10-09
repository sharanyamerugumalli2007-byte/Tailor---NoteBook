const { withTransaction } = require('../config/database');
const customerModel = require('../models/customerModel');
const measurementModel = require('../models/measurementModel');
const { AppError, ok, created, asyncHandler } = require('../utils/response');

async function requireCustomer(id) {
  const c = await customerModel.findById(id);
  if (!c) throw new AppError('Customer not found', 404);
  return c;
}

const listForCustomer = asyncHandler(async (req, res) => {
  await requireCustomer(req.params.customerId);
  ok(res, await measurementModel.listForCustomer(req.params.customerId));
});

const get = asyncHandler(async (req, res) => {
  const m = await measurementModel.findById(req.params.id);
  if (!m) throw new AppError('Measurement not found', 404);
  ok(res, m);
});

const create = asyncHandler(async (req, res) => {
  await requireCustomer(req.params.customerId);
  const m = await withTransaction((client) => measurementModel.createVersion(client, req.params.customerId, req.body));
  created(res, m, `Measurements saved as version ${m.version}`);
});

// "Editing" never overwrites: the submitted values become a new version, the old one stays in history
const update = asyncHandler(async (req, res) => {
  const old = await measurementModel.findById(req.params.id);
  if (!old) throw new AppError('Measurement not found', 404);
  const m = await withTransaction((client) => measurementModel.createVersion(client, old.customer_id, req.body));
  created(res, m, `Saved as new version ${m.version}. Previous versions are kept.`);
});

const restore = asyncHandler(async (req, res) => {
  const old = await measurementModel.findById(req.params.id);
  if (!old) throw new AppError('Measurement not found', 404);
  const note = `Restored from version ${old.version}`;
  const m = await withTransaction((client) =>
    measurementModel.createVersion(client, old.customer_id, { ...old, notes: old.notes ? `${old.notes} (${note})` : note }));
  created(res, m, `Version ${old.version} restored as new version ${m.version}`);
});

module.exports = { listForCustomer, get, create, update, restore };
