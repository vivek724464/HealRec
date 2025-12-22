const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generateOtp, getOtpKey } = require("../utils/otp");
const { sendMail } = require("../utils/emailconfig");
const { generateToken } = require("../utils/jwt");
const generateUniqueUsername=require("../utils/usernameGenerator");
const {normalizePhone, isEmail}=require("../utils/normalize")
const {sendSMS}=require("../utils/smsConfig");
const redis = require("../config/redis");
const OTP_TTL = 10 * 60;


const requestRegisterOtp = async (req, res) => {
  try {
    let { identifier, name, password, role } = req.body;

    if (!identifier || !password || !name || !role) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!["doctor", "patient"].includes(role)) {
      return res.json({ success: false, message: "Invalid role" });
    }

    let signupMethod, value;

    if (isEmail(identifier)) {
      signupMethod = "email";
      value = identifier.toLowerCase().trim();
    } else {
      signupMethod = "phone";
      value =normalizePhone(identifier);
    }

    const exists =
      (await Doctor.findOne({ [signupMethod]: value })) ||
      (await Patient.findOne({ [signupMethod]: value }));

    if (exists) {
      return res.json({
        success: false,
        message: `${signupMethod} already registered`,
      });
    }

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);
    const key = getOtpKey(signupMethod, value);

    await redis.setEx(
      key,
      OTP_TTL,
      JSON.stringify({
        otp,
        name,
        password: hashedPassword,
        role,
        signupMethod,
        identifier: value, 
      })
    );

    signupMethod === "email"
      ? await sendMail(value, "HealRec OTP", `Your OTP is ${otp}`)
      : await sendSMS(value, `Your HealRec OTP is ${otp}`);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      identifier: value,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};



const verifyRegisterOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.json({ success: false, message: "OTP is required" });
    }

    let signupMethod, value;

    if (isEmail(identifier)) {
      signupMethod = "email";
      value = identifier.toLowerCase().trim();
    } else {
      signupMethod = "phone";
      value = normalizePhone(identifier)
    }

    const key = getOtpKey(signupMethod, value);
    const raw = await redis.get(key);

    if (!raw) {
      return res.json({
        success: false,
        message: "OTP expired or invalid",
      });
    }

    const data = JSON.parse(raw);

    if (data.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (!["doctor", "patient"].includes(data.role)) {
      return res.json({
        success: false,
        message: "Invalid role",
      });
    }

    const Model = data.role === "doctor" ? Doctor : Patient;

    const username = await generateUniqueUsername(
      data.name,
      Doctor,
      Patient
    );

    const user = await Model.create({
      name: data.name,
      username,
      password: data.password,
      signupMethod: data.signupMethod,   
      [data.signupMethod]: data.identifier, 
    });

    await redis.del(key);

    return res.json({
      success: true,
      message: "Account created successfully",
      username,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "OTP verification failed",
    });
  }
};



//LOGIN
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }
     const cleanUsername = username.toLowerCase().trim();
    const user =
      (await Doctor.findOne({ username: cleanUsername })) ||
      (await Patient.findOne({ username: cleanUsername }));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid username or password",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
    const token = generateToken(user);
    return res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role || (user.specialization ? "doctor" : "patient"),
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}

//FORGOTPASSWORD
const forgotPassword = async (req, res) => {
  try {
    let { identifier } = req.body;
    if (!identifier) {
      return res.json({ success: false, message: "Identifier is required" });
    }

    if (!isEmail(identifier)) {
      identifier = normalizePhone(identifier);
    }

    const user =
      (await Doctor.findOne({ email: identifier })) ||
      (await Patient.findOne({ email: identifier })) ||
      (await Doctor.findOne({ phone: identifier })) ||
      (await Patient.findOne({ phone: identifier }));

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.signupMethod === "email") {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
      await user.save();

      const resetUrl = `http://localhost:${process.env.PORT}/HealRec/reset-password/${resetToken}`;

      await sendMail(
        user.email,
        "Password Reset - HealRec",
        `Click here to reset your password: ${resetUrl}`
      );

      return res.json({
        success: true,
        message: "Password reset link sent to your email",
      });
    }
    const otp = generateOtp();
    const normalizedPhone = normalizePhone(user.phone);
    const otpKey = getOtpKey("phone", normalizedPhone);

    await redis.set(
      otpKey,
      JSON.stringify({ userId: user._id.toString(), otp, attempts: 0 }),
      { EX: 600 }
    );
    await sendSMS(
      normalizedPhone,
      `Your HealRec OTP for password reset is: ${otp}`
    );
    return res.json({
      success: true,
      message: "OTP sent to your registered phone number",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

//RESETPASSWORD
const resetPassword = async (req, res) => {
  try {
    let { token, otp, password, phone } = req.body;

    if (!password) {
      return res.json({ success: false, message: "Password is required" });
    }

    let user;
    if (token) {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      user =
        (await Doctor.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpire: { $gt: Date.now() },
        })) ||
        (await Patient.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpire: { $gt: Date.now() },
        }));

      if (!user) {
        return res.json({ success: false, message: "Invalid or expired token" });
      }

    }
    else {
      if (!otp || !phone) {
        return res.json({
          success: false,
          message: "OTP and phone are required",
        });
      }
      const normalizedPhone = normalizePhone(phone);
      const otpKey = getOtpKey("phone", normalizedPhone);

      const raw = await redis.get(otpKey);
      if (!raw) {
        return res.json({ success: false, message: "OTP expired or invalid" });
      }

      const data = JSON.parse(raw);

      if (data.attempts >= 3) {
        await redis.del(otpKey);
        return res.json({
          success: false,
          message: "Too many invalid attempts",
        });
      }

      if (data.otp !== otp) {
        data.attempts += 1;
        await redis.set(otpKey, JSON.stringify(data), { EX: 600 });
        return res.json({ success: false, message: "Invalid OTP" });
      }

      user =
        (await Doctor.findById(data.userId)) ||
        (await Patient.findById(data.userId));

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      await redis.del(otpKey);
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    if (user.signupMethod === "email") {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

const searchUserByUsername = async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Query 'q' is required" });
    }

    const regex = new RegExp(q, "i");

    const skip = (page - 1) * limit;
    const [doctors, patients] = await Promise.all([
      Doctor.find({ username: regex }).select("username name email role").skip(skip).limit(Number(limit)),
      Patient.find({ username: regex }).select("username name email role").skip(skip).limit(Number(limit)),
    ]);

    const results = [...doctors, ...patients];

    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to search users" });
  }
};


module.exports = { requestRegisterOtp, verifyRegisterOtp, login, forgotPassword, resetPassword ,searchUserByUsername};
