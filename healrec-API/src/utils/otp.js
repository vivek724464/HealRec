const crypto = require("crypto");

exports.generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

exports.getOtpKey = (type, value) =>
  `otp:${type}:${value}`;
