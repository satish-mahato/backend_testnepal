const { z } = require('zod');

// Helper function to validate image URLs
const isValidImageUrl = (value) => {
  return typeof value === 'string' && 
         value.startsWith('/uploads/products/') &&
         (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.pdf'));
};

// Custom error messages
const errorMessages = {
  required: (field) => `${field} is required`,
  minLength: (field, length) => `${field} must be at least ${length} characters`,
  maxLength: (field, length) => `${field} cannot exceed ${length} characters`,
  invalidType: (field, type) => `${field} must be a ${type}`,
  positiveNumber: (field) => `${field} must be a positive number`,
  nonNegative: (field) => `${field} cannot be negative`,
  maxValue: (field, value) => `${field} cannot exceed ${value}`,
  invalidImage: "Invalid image URL format. Must start with '/uploads/products/' and be .jpg, .jpeg, .png, or .pdf",
  minImages: "At least one product image is required",
  maxImages: "Cannot upload more than 5 images",
  invalidId: "Invalid product ID format"
};

// Base product schema
const productBaseSchema = z.object({
  name: z.string({
    required_error: errorMessages.required('Product name'),
    invalid_type_error: errorMessages.invalidType('Product name', 'string')
  })
  .min(3, { message: errorMessages.minLength('Product name', 3) })
  .max(100, { message: errorMessages.maxLength('Product name', 100) })
  .trim(),

  description: z.string({
    required_error: errorMessages.required('Description'),
    invalid_type_error: errorMessages.invalidType('Description', 'string')
  })
  .min(10, { message: errorMessages.minLength('Description', 10) })
  .max(1000, { message: errorMessages.maxLength('Description', 1000) })
  .trim(),

  price: z.union([
    z.number({
      required_error: errorMessages.required('Price'),
      invalid_type_error: errorMessages.invalidType('Price', 'number')
    })
    .positive({ message: errorMessages.positiveNumber('Price') })
    .max(1000000, { message: errorMessages.maxValue('Price', '1,000,000') }),
    z.string().transform(parseFloat).pipe(
      z.number()
      .positive({ message: errorMessages.positiveNumber('Price') })
      .max(1000000, { message: errorMessages.maxValue('Price', '1,000,000') })
    )
  ]),

  stock: z.union([
    z.number({
      required_error: errorMessages.required('Stock'),
      invalid_type_error: errorMessages.invalidType('Stock', 'number')
    })
    .int({ message: 'Stock must be an integer' })
    .nonnegative({ message: errorMessages.nonNegative('Stock') })
    .max(100000, { message: errorMessages.maxValue('Stock', '100,000') }),
    z.string().transform(parseInt).pipe(
      z.number()
      .int({ message: 'Stock must be an integer' })
      .nonnegative({ message: errorMessages.nonNegative('Stock') })
      .max(100000, { message: errorMessages.maxValue('Stock', '100,000') })
    )
  ]),

  category: z.string({
    required_error: errorMessages.required('Category'),
    invalid_type_error: errorMessages.invalidType('Category', 'string')
  })
  .min(3, { message: errorMessages.minLength('Category', 3) })
  .max(50, { message: errorMessages.maxLength('Category', 50) })
  .transform(val => val.toLowerCase())
});

// Schema for creating a product
const productCreateSchema = productBaseSchema.extend({
  images: z.array(
    z.string().refine(isValidImageUrl, {
      message: errorMessages.invalidImage
    }),
    {
      required_error: errorMessages.minImages,
      invalid_type_error: errorMessages.invalidType('Images', 'array')
    }
  )
  .min(1, { message: errorMessages.minImages })
  .max(5, { message: errorMessages.maxImages })
});

// Schema for updating a product
const updateProductSchema = productBaseSchema.partial().extend({
  images: z.array(
    z.string().refine(isValidImageUrl, {
      message: errorMessages.invalidImage
    })
  )
  .max(5, { message: errorMessages.maxImages })
  .optional(),
  id: z.string().uuid({ message: errorMessages.invalidId }).optional()
});

module.exports = {
  productCreateSchema,
  updateProductSchema,
  errorMessages
};