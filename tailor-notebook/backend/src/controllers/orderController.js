const { withTransaction } = require('../config/database');
const customerModel = require('../models/customerModel');
const measurementModel = require('../models/measurementModel');
const orderModel = require('../models/orderModel');
const { notifyAll } = require('../services/notificationService');
const { calcPayment } = require('../utils/orderCalc');
const { AppError, ok, created, asyncHandler } = require('../utils/response');

const FINAL = ['DELIVERED', 'CANCELLED'];

// The measurement version must exist and belong to the same customer (never trust client-supplied IDs)
async function checkMeasurement(measurementId, customerId) {
  if (!measurementId) return;
  const m = await measurementModel.findById(measurementId);
  if (!m || m.customer_id !== customerId) throw new AppError('Selected measurement does not belong to this customer', 400);
}

function payment(items, advance) {
  const p = calcPayment(items, advance);
  if (p.error) throw new AppError(p.error, 400);
  return p;
}

const list = asyncHandler(async (req, res) => ok(res, await orderModel.list(req.validatedQuery)));

const get = asyncHandler(async (req, res) => {
  const o = await orderModel.findById(req.params.id);
  if (!o) throw new AppError('Order not found', 404);
  ok(res, o);
});

const forCustomer = asyncHandler(async (req, res) => {
  if (!(await customerModel.findById(req.params.customerId))) throw new AppError('Customer not found', 404);
  ok(res, await orderModel.forCustomer(req.params.customerId));
});

const create = asyncHandler(async (req, res) => {
  const d = req.body;
  const customer = await customerModel.findById(d.customer_id);
  if (!customer) throw new AppError('Customer not found', 404);
  await checkMeasurement(d.measurement_id, d.customer_id);
  const pay = payment(d.items, d.advance_amount);

  const order = await withTransaction(async (client) => {
    // Default to the customer's current measurement version when none is chosen
    if (!d.measurement_id) {
      const cur = await measurementModel.findCurrent(d.customer_id);
      if (cur) d.measurement_id = cur.id;
    }
    const id = await orderModel.create(client, d, pay);
    await notifyAll({ title: 'New order created', message: `Order #${id} was created for ${customer.name}.`, type: 'ORDER_CREATED' }, client);
    return orderModel.findById(id, client);
  });
  created(res, order, 'Order created successfully');
});

const update = asyncHandler(async (req, res) => {
  const existing = await orderModel.findById(req.params.id);
  if (!existing) throw new AppError('Order not found', 404);
  if (FINAL.includes(existing.status)) throw new AppError(`A ${existing.status.toLowerCase()} order can no longer be edited`, 409);
  await checkMeasurement(req.body.measurement_id, existing.customer_id);
  const pay = payment(req.body.items, req.body.advance_amount);
  const order = await withTransaction(async (client) => {
    await orderModel.update(client, existing.id, req.body, pay);
    return orderModel.findById(existing.id, client);
  });
  ok(res, order, 'Order updated successfully');
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const o = await orderModel.findById(req.params.id);
  if (!o) throw new AppError('Order not found', 404);
  if (FINAL.includes(o.status)) throw new AppError(`Order is already ${o.status.toLowerCase()} and its status can't be changed`, 409);
  if (o.status === status) throw new AppError('Order already has this status', 400);

  const order = await withTransaction(async (client) => {
    await orderModel.setStatus(client, o.id, status, notes);
    const label = status.toLowerCase().replace(/_/g, ' ');
    await notifyAll(status === 'READY'
      ? { title: 'Order ready', message: `Order #${o.id} is now ready.`, type: 'ORDER_READY' }
      : { title: 'Order status changed', message: `Order #${o.id} (${o.customer_name}) is now ${label}.`, type: 'ORDER_STATUS' }, client);
    return orderModel.findById(o.id, client);
  });
  ok(res, order, 'Order status updated');
});

const remove = asyncHandler(async (req, res) => {
  if (!(await orderModel.remove(req.params.id))) throw new AppError('Order not found', 404);
  ok(res, null, 'Order deleted');
});

module.exports = { list, get, forCustomer, create, update, updateStatus, remove };
