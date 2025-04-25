const redisClient = require("../services/redis.service.js");
const {
  createUser,
  loginUser,
  findUserById,
  updateUserProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  verifyTokenUser,
} = require("../services/user.service.js");
const { getFromRedis, setInRedis } = require("../utils/auth.js");
const {
  handleControllerError,
  clearUserCache,
  sanitizeUser,
} = require("../utils/controllerHelpers.js");

const controllerHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const createUserController = controllerHandler(async (req, res) => {
  const user = await createUser(req.body);
  await clearUserCache(user.id);

  res.status(201).json({
    message: "User registered successfully",
    user: sanitizeUser(user),
  });
});

const loginUserController = controllerHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser(email, password);

  res.status(200).json({
    message: "Login successful",
    user: sanitizeUser(user),
    token,
  });
});

const userProfileController = controllerHandler(async (req, res) => {
  const redisKey = `user:profile:${req.user.id}`;
  const cachedProfile = await getFromRedis(redisKey);

  if (cachedProfile) return res.json(cachedProfile);

  const user = await findUserById(req.user.id);
  await setInRedis(redisKey, user);

  res.json(sanitizeUser(user));
});

const updateUserProfileController = controllerHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name && !email) {
    throw new UserError("At least one field (name, email) must be provided");
  }

  const updatedUser = await updateUserProfile(userId, { name, email });
  await clearUserCache(userId);

  res.status(200).json({
    message: "Profile updated successfully",
    user: sanitizeUser(updatedUser),
  });
});

const changePasswordController = controllerHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await changePassword(req.user.id, oldPassword, newPassword);

  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    await redisClient.set(token, "logout", "EX", 86400); // 24h in seconds
  }

  res.status(200).json({ message: "Password changed successfully" });
});

const logoutController = controllerHandler(async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("Token required for logout");
  }

  await redisClient.set(token, "logout", "EX", 86400);
  res.clearCookie("token");

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsersController = controllerHandler(async (req, res) => {
  const users = await getAllUsers(req.user.id);
  const sanitizedUsers = users.map((user) => sanitizeUser(user));
  res.status(200).json(sanitizedUsers);
});

const userVerifyController = controllerHandler(async (req, res) => {
  const { token } = req.params;
  const verifiedUser = await verifyTokenUser({ token });

  const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified Successfully</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f7fa;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #333;
        }
        .container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          padding: 40px;
          text-align: center;
          max-width: 500px;
          width: 90%;
        }
        .success-icon {
          color: #4CAF50;
          font-size: 60px;
          margin-bottom: 20px;
        }
        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        p {
          font-size: 18px;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .user-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
        .btn {
          display: inline-block;
          background: #3498db;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background 0.3s;
        }
        .btn:hover {
          background: #2980b9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>Email Verified Successfully!</h1>
        <p>Thank you for verifying your email address.</p>
        
        <div class="user-info">
          <p><strong>Email:</strong> ${verifiedUser.email}</p>
          <p><strong>Status:</strong> Verified</p>
        </div>
        
        <p>You can now enjoy all the features of our service.</p>
        <a href="/login" class="btn">Continue to Login</a>
      </div>
    </body>
    </html>
  `;

  res.status(200).set("Content-Type", "text/html").send(htmlResponse);
});

const deleteUserController = controllerHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const requestingUser = req.user;

  if (!requestingUser.isAdmin) {
    return res
      .status(403)
      .json({ message: "Only administrators can delete users" });
  }

  await deleteUser(userId);
  await clearUserCache(userId);

  if (requestingUser.id === userId) {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (token) {
      await redisClient.set(token, "logout", "EX", 86400);
      res.clearCookie("token");
    }
  }

  res.status(200).json({ message: "User deleted successfully" });
});

module.exports = {
  createUserController,
  loginUserController,
  userProfileController,
  updateUserProfileController,
  changePasswordController,
  logoutController,
  getAllUsersController,
  userVerifyController,
  deleteUserController,
};
