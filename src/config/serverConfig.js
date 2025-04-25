require("dotenv").config();

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const MAILTRAP_HOST = process.env.MAILTRAP_HOST;
const MAILTRAP_PORT = process.env.MAILTRAP_PORT;
const MAILTRAP_USERNAME = process.env.MAILTRAP_USERNAME;
const MAILTRAP_PASSWORD = process.env.MAILTRAP_PASSWORD;
const MAILTRAP_SENDEREMAIL = process.env.MAILTRAP_SENDEREMAIL;
const BASE_URL = process.env.BASE_URL;
const FRONTEND_URL=process.env.FRONTEND_URL;
const LOCAL_HOST = process.env.LOCAL_HOST 


module.exports = {
  PORT,
  JWT_SECRET,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  MAILTRAP_HOST,
  MAILTRAP_PORT,
  MAILTRAP_USERNAME,
  MAILTRAP_PASSWORD,
  MAILTRAP_SENDEREMAIL,
  BASE_URL,
  FRONTEND_URL,
  LOCAL_HOST,
};
