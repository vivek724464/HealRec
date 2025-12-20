const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generateOtp, getOtpKey } = require("../utils/otp");
const { sendMail } = require("../utils/emailconfig");
const { generateToken } = require("../utils/jwt");
const generateUniqueUsername=require("../utils/usernameGenerator")
const {sendSMS}=require("../utils/smsConfig");
const redis = require("../config/redis");
const OTP_TTL = 10 * 60;


const requestRegisterOtp = async (req, res) => {
  try {
    let {identifier,name, password, role } = req.body;
    if (!identifier || !password || !name || !role) {
      return res.json({ success: false, message: "All fields are required" });
    }
      let type, value;
    if (identifier.includes("@")) {
      type = "email";
      value = identifier.toLowerCase();
    } else {
      type = "phone";
      value = identifier.startsWith("+91")
        ? identifier
        : "+91" + identifier.replace(/^0+/, "");
    }
    const exists =
      (await Doctor.findOne({ [type]: value })) ||
      (await Patient.findOne({ [type]: value }));
   
    if (exists) {
      return res.json({ success: false, message: "${type} already registered" });
    }
    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);

    const key = getOtpKey(type, value);
     await redis.setEx(
      key,
      OTP_TTL,
      JSON.stringify({
        name,
        password: hashedPassword,
        role,
        type,
        value,
      })
    );
     if (type === "email") {
      await sendMail(value, "HealRec OTP", `Your OTP is ${otp}`);
    } else {
      await sendSMS(value, `Your HealRec OTP is ${otp}`);
    }
      await redis.setEx(`${key}:otp`, OTP_TTL, otp);

    res.json({ success: true, message: "OTP sent successfully", identifier});

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

const verifyRegisterOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.json({ success: false, message: "OTP is required" });
    }
    let type, value;
    if (identifier.includes("@")) {
      type = "email";
      value = identifier.toLowerCase();
    } else {
      type = "phone";
      value = identifier.startsWith("+91")
        ? identifier
        : "+91" + identifier.replace(/^0+/, "");
    }
    const key = getOtpKey(type, value);

    const storedOtp = await redis.get(`${key}:otp`);
    const userData = await redis.get(key);

    if (!storedOtp || !userData || storedOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const data = JSON.parse(userData);

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
      [type]: value,
    });

    await redis.del(key);
    await redis.del(`${key}:otp`);

    res.json({
      success: true,
      message: "Account created successfully",
      username
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "OTP verification failed", error: error.message });
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
      token: token
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
    const { email } = req.body;
    const existingUser = await Doctor.findOne({ email: email }) || await Patient.findOne({ email: email });
    if (!existingUser) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    existingUser.resetPasswordToken = hashedToken;
    existingUser.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await existingUser.save();
    const resetUrl = `http://localhost:${process.env.PORT}/HealRec/reset-password/${resetToken}`;
    await sendMail(
      email,
      "Password Reset - HealRec",
      `Click here to reset your password: ${resetUrl}`
    )
    return res.json({
      success: true,
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

//RESETPASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await Doctor.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }) || await Patient.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired token"
      });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    await sendMail(
      user.email,
      "Password Reset confirmation - HealRec",
      "Password reset successfully"
    )
    return res.json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


module.exports = { requestRegisterOtp, verifyRegisterOtp, login, forgotPassword, resetPassword };
