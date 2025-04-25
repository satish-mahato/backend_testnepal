
const { z } = require('zod');

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      msg: issue.message,
      param: issue.path.join('.'),
      location: 'body',
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
};

module.exports = { validateRequest };