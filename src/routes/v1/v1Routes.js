const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes/userRoutes.js");
const productRoutes = require("./productRoutes/productRoutes.js");

router.use("/users", userRoutes);
router.use("/product", productRoutes);

module.exports = router;
