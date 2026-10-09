const logger = require('../utils/logger');

const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

// Maps PostgreSQL error codes to friendly responses. Raw DB errors are never sent to the client.
function mapPgError(err) {
  switch (err.code) {
    case '23505': return [409, 'A record with these details already exists'];
    case '23503': return [409, 'This record is linked to other data and cannot be changed this way'];
    case '23514': return [400, 'One of the values is not allowed'];
    case '23502': return [400, 'A required value is missing'];
    case '22P02': case '22007': case '22008': return [400, 'Invalid value format'];
    default: return null;
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  if (err.isAppError) {
    return res.status(err.status).json({ success: false, message: err.message, ...(err.details && { errors: err.details }) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
  }
  const pg = err.code && mapPgError(err);
  if (pg) {
    logger.warn('DB constraint:', err.code, err.constraint || '');
    return res.status(pg[0]).json({ success: false, message: pg[1] });
  }
  logger.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
};

module.exports = { notFound, errorHandler };
