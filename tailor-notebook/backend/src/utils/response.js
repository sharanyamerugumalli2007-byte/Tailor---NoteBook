class AppError extends Error {
  constructor(message, status = 400, details) {
    super(message);
    this.status = status;
    this.details = details;
    this.isAppError = true;
  }
}

const ok = (res, data = null, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = 'Created successfully') => ok(res, data, message, 201);

// Wraps async route handlers so rejected promises reach the error middleware
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { AppError, ok, created, asyncHandler };
