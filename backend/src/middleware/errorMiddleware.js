const logger = require('../utils/logger');

const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

// Maps common Oracle constraint/input codes to safe API errors.
function mapOracleError(err) {
  switch (err.code) {
    case 'ORA-00001': return [409, 'A record with these details already exists'];
    case 'ORA-02291': case 'ORA-02292': return [409, 'This record is linked to other data and cannot be changed this way'];
    case 'ORA-01400': case 'ORA-01407': return [400, 'A required value is missing'];
    case 'ORA-02290': return [400, 'One of the values is not allowed'];
    case 'ORA-01830': case 'ORA-01843': case 'ORA-01861': return [400, 'Invalid date or time format'];
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
  const dbError = err.code && mapOracleError(err);
  if (dbError) {
    logger.warn('DB constraint:', err.code, err.constraint || '');
    return res.status(dbError[0]).json({ success: false, message: dbError[1] });
  }
  logger.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
};

module.exports = { notFound, errorHandler };
