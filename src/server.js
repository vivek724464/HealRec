const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const userRouter = require("./routes/userRoutes");
const reportRouter = require("./routes/reportRoutes");

app.use("/HealRec/users", userRouter);
app.use("/HealRec/reports", reportRouter);

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
