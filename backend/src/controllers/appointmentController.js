const customerModel = require('../models/customerModel');
const appointmentModel = require('../models/appointmentModel');
const { notifyAll } = require('../services/notificationService');
const { AppError, ok, created, asyncHandler } = require('../utils/response');

const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in server local time

async function assertNoConflict(d, excludeId) {
  if (d.status === 'CANCELLED' || d.status === 'COMPLETED') return;
  const clash = await appointmentModel.findConflict(d.appointment_date, d.appointment_time, excludeId);
  if (clash) throw new AppError(`That time is already booked for ${clash.customer_name}. Choose a different time.`, 409);
}

const list = asyncHandler(async (req, res) => ok(res, await appointmentModel.list(req.validatedQuery)));

const get = asyncHandler(async (req, res) => {
  const a = await appointmentModel.findById(req.params.id);
  if (!a) throw new AppError('Appointment not found', 404);
  ok(res, a);
});

const create = asyncHandler(async (req, res) => {
  const d = req.body;
  const customer = await customerModel.findById(d.customer_id);
  if (!customer) throw new AppError('Customer not found', 404);
  if (d.appointment_date < todayStr()) throw new AppError('Appointment date cannot be in the past', 400);
  await assertNoConflict(d);
  const id = await appointmentModel.create(d);
  await notifyAll({ title: 'Appointment scheduled', type: 'APPOINTMENT',
    message: `Appointment with ${customer.name} on ${d.appointment_date} at ${d.appointment_time}.` });
  created(res, await appointmentModel.findById(id), 'Appointment scheduled');
});

const update = asyncHandler(async (req, res) => {
  const old = await appointmentModel.findById(req.params.id);
  if (!old) throw new AppError('Appointment not found', 404);
  const d = req.body;
  if (!(await customerModel.findById(d.customer_id))) throw new AppError('Customer not found', 404);
  const moved = d.appointment_date !== old.appointment_date || d.appointment_time.slice(0, 5) !== old.appointment_time.slice(0, 5);
  // Moving an active appointment to a new slot marks it as rescheduled unless a status was chosen
  if (moved && !d.status && old.status === 'SCHEDULED') d.status = 'RESCHEDULED';
  await assertNoConflict({ ...d, status: d.status || old.status }, old.id);
  await appointmentModel.update(old.id, d);
  ok(res, await appointmentModel.findById(old.id), 'Appointment updated');
});

const updateStatus = asyncHandler(async (req, res) => {
  const a = await appointmentModel.findById(req.params.id);
  if (!a) throw new AppError('Appointment not found', 404);
  const { status } = req.body;
  if (['SCHEDULED', 'RESCHEDULED'].includes(status)) await assertNoConflict({ ...a, status }, a.id);
  await appointmentModel.setStatus(a.id, status);
  if (status === 'CANCELLED') {
    await notifyAll({ title: 'Appointment cancelled', type: 'APPOINTMENT',
      message: `Appointment with ${a.customer_name} on ${a.appointment_date} was cancelled.` });
  }
  ok(res, await appointmentModel.findById(a.id), 'Appointment status updated');
});

const remove = asyncHandler(async (req, res) => {
  if (!(await appointmentModel.remove(req.params.id))) throw new AppError('Appointment not found', 404);
  ok(res, null, 'Appointment deleted');
});

module.exports = { list, get, create, update, updateStatus, remove };
