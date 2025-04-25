const prisma = require("../prisma/client.js");
const {
  generateJWT,
  generateToken,
  hashPassword,
  validatePassword,
} = require("../utils/auth.js");
const { UserError, AuthenticationError } = require("../utils/error.js");
const { sendMail } = require("../utils/mailSend.js");

const createUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) throw new UserError("Email is already Registered");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      verificationToken: generateToken(),
      isVerified: false,
      isAdmin: false,
    },
  });
  
  await sendMail(user.email, user.verificationToken);
  console.log("mail sent");

  return user;
};

const verifyTokenUser = async ({ token }) => {
  const verifyUser = await prisma.user.findFirst({
    where: { verificationToken: token },
  });
  if (!verifyUser) {
    throw new AuthenticationError("invalid token");
  }
  const updateUser = await prisma.user.update({
    where: { id: verifyUser.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });
  return updateUser;
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthenticationError("Email not found");
  }

  const isValid = await validatePassword(password, user.password);
  if (!isValid) {
    throw new AuthenticationError("Incorrect password");
  }

  const token = generateJWT(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

const getAllUsers = async (excludeUserId) => {
  return prisma.user.findMany({
    where: { id: { not: excludeUserId } },
    select: { id: true, name: true, email: true },
  });
};

const updateUserProfile = async (userId, { name, email }) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name, email },
  });
};

const findUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UserError("User not found");
  }

  const isValid = await validatePassword(oldPassword, user.password);
  if (!isValid) {
    throw new AuthenticationError("Invalid current password");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      password: await hashPassword(newPassword),
    },
  });
};

const deleteUser = async (userId) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

module.exports = {
  createUser,
  verifyTokenUser,
  loginUser,
  getAllUsers,
  updateUserProfile,
  findUserById,
  changePassword,
  deleteUser
};