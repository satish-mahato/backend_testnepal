const express = require("express");
const { authUser } = require("../../../middleware/authMiddleware");
const {
  upload,
  handleUploadErrors,
} = require("../../../middleware/multerConfig");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} = require("../../../controllers/product.controller");
const {
  updateProductSchema,
  productCreateSchema,
} = require("../../../schemas/productSchema");
const { validateRequest } = require("../../../utils/zodValidator");
const router = express.Router();


router.post('/', 
  upload.array('images', 5),
  (req, res, next) => {
    // Transform files to paths for validation
    if (req.files) {
      req.body.images = req.files.map(file => `/uploads/products/${file.filename}`);
    }
    next();
  },
  validateRequest(productCreateSchema),
  createProduct
);

router.put(
  "/:id",
  authUser,

  upload.array("images", 5),
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  authUser,

  deleteProduct
);

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Multer error handler
router.use(handleUploadErrors);

module.exports = router;
