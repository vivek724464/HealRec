const Doctor = require("../models/docSchema");
const redis = require("../config/redis");
const { normalizePhone } = require("../utils/normalize");
const { isEmailOrPhoneTaken } = require("../utils/GlobalUnique");
const { sendMail } = require("../utils/emailconfig");
const { sendSMS } = require("../utils/smsConfig");
const { generateOtp } = require("../utils/otp");

const updateDoctorProfileOtpRequest = async (req, res) => {
  const doctorId = req.user.id;
  let lockKey = null;

  try {
    const {
      email,
      phone,
      gender,
      availability,
      specialization,
      qualifications,
      yearsOfExperience,
      licenseNumber,
      consultationFee,
      clinic,
    } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    let type = null;
    let value = null;

    if (email) {
      type = "email";
      value = email.toLowerCase();
    } else if (phone) {
      type = "phone";
      value = normalizePhone(phone);
    }
    if (type && type === doctor.signupMethod) {
      return res.json({
        success: false,
        message: `${type} used during signup cannot be updated`,
      });
    }
    if (!type) {
      Object.assign(doctor, {
        gender,
        availability,
        specialization,
        qualifications,
        yearsOfExperience,
        licenseNumber,
        consultationFee,
        clinic,
      });

      await doctor.save();
      return res.json({
        success: true,
        message: "Profile updated successfully",
      });
    }
    const exists = await isEmailOrPhoneTaken({
      email: type === "email" ? value : null,
      phone: type === "phone" ? value : null,
      excludeUserId: doctorId,
    });

    if (exists) {
      return res.json({
        success: false,
        message: `${type} already in use`,
      });
    }
    lockKey = `lock:${type}:${value}`;
    const locked = await redis.set(lockKey, String(doctorId), {
      NX: true,
      EX: 30,
    });

    if (!locked) {
      return res.json({
        success: false,
        message: `${type} verification already in progress`,
      });
    }

    const otp = generateOtp();
    const otpKey = `otp:profileUpdate:${doctorId}`;

    await redis.set(
      otpKey,
      JSON.stringify({
        otp,
        type,
        value,
        attempts: 0,
        otherData: {
          gender,
          availability,
          specialization,
          qualifications,
          yearsOfExperience,
          licenseNumber,
          consultationFee,
          clinic,
        },
      }),
      { EX: 600 }
    );
    type === "email"
      ? await sendMail(value, "HealRec OTP", `Your OTP is ${otp}`)
      : await sendSMS(value, `Your HealRec OTP is ${otp}`);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    if (lockKey) await redis.del(lockKey);
    console.error(err);
    return res.json({
      success: false,
      message: "Failed to initiate profile update",
    });
  }
};

const verifyDoctorProfileOtp = async (req, res) => {
  const doctorId = req.user.id;
  const { otp } = req.body;

  if (!otp) {
    return res.json({
      success: false,
      message: "OTP is required",
    });
  }

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const otpKey = `otp:profileUpdate:${doctorId}`;
    const raw = await redis.get(otpKey);

    if (!raw) {
      return res.json({
        success: false,
        message: "OTP expired or invalid",
      });
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
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (data.type === "email") doctor.email = data.value;
    else doctor.phone = data.value;

    Object.assign(doctor, data.otherData || {});
    await doctor.save();

    await redis.del(otpKey);
    await redis.del(`lock:${data.type}:${data.value}`);

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

module.exports = {
  updateDoctorProfileOtpRequest,
  verifyDoctorProfileOtp,
};
