const { AppError } = require('../utils/response');

/** validate(schema, 'body' | 'query' | 'params') — replaces the source with the parsed (coerced) value. */
const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    const first = details[0];
    const msg = first.field ? `${first.field}: ${first.message}` : first.message;
    return next(new AppError(msg, 400, details));
  }
  if (source === 'query') req.validatedQuery = result.data; // req.query is read-only in newer Express
  else req[source] = result.data;
  next();
};

const idParam = (name = 'id') => (req, _res, next) => {
  const n = Number(req.params[name]);
  if (!Number.isInteger(n) || n <= 0) return next(new AppError(`Invalid ${name}`, 400));
  req.params[name] = n;
  next();
};

module.exports = { validate, idParam };
