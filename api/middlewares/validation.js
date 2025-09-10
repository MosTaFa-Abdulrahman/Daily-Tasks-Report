const Joi = require("joi");

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };
};

// Validation schemas
const schemas = {
  // Employee schemas
  employee: Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional().allow(""),
    position: Joi.string().optional().allow(""),
  }),

  employeeUpdate: Joi.object({
    name: Joi.string().optional().trim(),
    phone: Joi.string().optional().allow(""),
    position: Joi.string().optional().allow(""),
  }),

  // Task schema
  task: Joi.object({
    employeeId: Joi.string().required(),
    description: Joi.string().required().trim(),
    from: Joi.date().iso().required(),
    to: Joi.date().iso().greater(Joi.ref("from")).required(),
  })
    .custom((value, helpers) => {
      const { from, to } = value;
      const fromTime = new Date(from);
      const toTime = new Date(to);

      // Check if both dates are on the same day
      if (fromTime.toDateString() !== toTime.toDateString()) {
        return helpers.error("custom.differentDays");
      }

      // Check if duration doesn't exceed 8 hours
      const duration = (toTime - fromTime) / (1000 * 60 * 60);
      if (duration > 8) {
        return helpers.error("custom.maxDuration");
      }

      return value;
    })
    .messages({
      "custom.differentDays": "Task start and end time must be on the same day",
      "custom.maxDuration": "Task duration cannot exceed 8 hours",
    }),
};

module.exports = { validate, schemas };
