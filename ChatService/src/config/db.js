const mongoose = require("mongoose");

const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) {
      console.log("MongoDB URI not provided!");
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
