const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");

const isEmailOrPhoneTaken = async ({ email, phone, excludeUserId }) => {
  const query = [];

  if (email) query.push({ email });
  if (phone) query.push({ phone });

  if (!query.length) return false;

  const condition = { $or: query };

  const doctor = await Doctor.findOne({
    ...condition,
    _id: { $ne: excludeUserId },
  });

  const patient = await Patient.findOne({
    ...condition,
    _id: { $ne: excludeUserId },
  });

  return !!(doctor || patient);
};
module.exports={isEmailOrPhoneTaken};
