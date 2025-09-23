const express=require("express");
const dotenv = require("dotenv");
const path=require("path");
const connectDB=require("./config/db");
const userRouter=require("./routes/userRoutes")

dotenv.config();
connectDB();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/HealRec", userRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));