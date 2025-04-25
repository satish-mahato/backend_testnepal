const { fileUploadSchema,  } = require("../schemas/file.schema.js");

const validateRequest = (schema) => (req, res, next) => {
  try {
    const dataToValidate = schema === fileUploadSchema 
      ? { ...req.body, ...req.files }
      : req.body;

    schema.parse(dataToValidate);
    next();
  } catch (error) {
    const formattedErrors = error.errors.map((err) => {
      let message = err.message;
      
      if (err.code === "too_small" && err.minimum === 1) {
        message = `${err.path.join(".")} cannot be empty`;
      }
      
      return {
        field: err.path.join("."),
        message: message,
        type: err.code || "invalid_type",
      };
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed. Please check your input",
      errors: formattedErrors,
    });
  }
};

module.exports = { validateRequest };