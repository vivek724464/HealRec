const crypto = require("crypto");

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const getOtpKey = (type, value) =>
  `otp:${type}:${value}`;
module.exports={generateOtp, getOtpKey}
