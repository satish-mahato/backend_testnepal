const express = require("express");
const router = express.Router();

const {
  loginSchema,
  passwordSchema,
  registerSchema,
} = require("../../../schemas/user.schema.js");
const { validateRequest } = require("../../../utils/zodValidator.js");
const {
  changePasswordController,
  createUserController,
  deleteUserController,
  getAllUsersController,
  loginUserController,
  logoutController,
  updateUserProfileController,
  userProfileController,
  userVerifyController,
} = require("../../../controllers/user.controller.js");
const { authUser } = require("../../../middleware/authMiddleware.js");

router.post("/register", validateRequest(registerSchema), createUserController);
router.post("/login", validateRequest(loginSchema), loginUserController);
router.get("/profile", authUser, userProfileController);
router.get("/verify/:token", userVerifyController);
router.put("/update", authUser, updateUserProfileController);
router.put(
  "/change-password",
  validateRequest(passwordSchema),
  authUser,
  changePasswordController
);
router.post("/logout", authUser, logoutController);

router.get("/all", authUser, getAllUsersController);
router.delete("/delete/:id", authUser, deleteUserController);

module.exports = router;