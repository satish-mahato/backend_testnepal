class UserError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "UserError";
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
  }
}

module.exports = {
  UserError,
  AuthenticationError,
  default: UserError 
};