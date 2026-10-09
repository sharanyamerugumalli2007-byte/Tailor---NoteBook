const customerModel = require('../models/customerModel');
const measurementModel = require('../models/measurementModel');
const orderModel = require('../models/orderModel');
const pdf = require('../services/pdfService');
const { AppError, asyncHandler } = require('../utils/response');

// GET /api/pdf/measurements/:customerId?measurementId=ID  (defaults to the current version)
const measurements = asyncHandler(async (req, res) => {
  const customer = await customerModel.findById(req.params.customerId);
  if (!customer) throw new AppError('Customer not found', 404);
  const mid = Number(req.query.measurementId);
  const m = mid ? await measurementModel.findById(mid) : await measurementModel.findCurrent(customer.id);
  if (!m || m.customer_id !== customer.id) throw new AppError('No measurements found for this customer', 404);
  pdf.measurementCard(res, customer, m);
});

const order = asyncHandler(async (req, res) => {
  const o = await orderModel.findById(req.params.orderId);
  if (!o) throw new AppError('Order not found', 404);
  pdf.orderReceipt(res, o);
});

module.exports = { measurements, order };
