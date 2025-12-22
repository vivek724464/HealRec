const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors")

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// Allow common local dev ports including 8080 (Vite sometimes uses 8080)
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://192.168.56.1:8080",
];
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return cb(null, true);
      return cb(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    preflightContinue: false,
  })
);
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const userRouter = require("./routes/userRoutes");
const reportRouter = require("./routes/reportRoutes");
const followRouter=require("./routes/followRoutes");
const docRouter=require("./routes/docRoutes");
const patientRouter=require("./routes/patientRoutes");

app.use("/HealRec/users", userRouter);
app.use("/HealRec/reports", reportRouter);
app.use("/HealRec/followers", followRouter);
app.use("/HealRec/doctor",docRouter);
app.use("/HealRec/patient", patientRouter);


app.get("/", (req, res) => {
  res.send("Welcome to HealRec API");
});

app.get("/HealRec/health", (req, res) => {
  res.json({ status: "UP" });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
