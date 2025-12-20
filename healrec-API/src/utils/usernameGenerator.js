const Doctor=require("../models/docSchema");
const Patient=require("../models/docSchema");
module.exports = async function generateUniqueUsername(name, Doctor, Patient) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  while (true) {
    const random = Math.floor(1000 + Math.random() * 9000);
    const username = base + random;

    const exists =
      (await Doctor.findOne({ username })) ||
      (await Patient.findOne({ username }));

    if (!exists) return username;
  }
};
