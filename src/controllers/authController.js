const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");
const bcrypt = require("bcrypt");
const crypto=require("crypto");
const {sendMail}=require("../utils/emailconfig");
const { generateToken } = require("../utils/jwt");

const register = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.json({
                success: false,
                message: "Please provide all fields"
            })
        }
        let existingUser = await Doctor.findOne({ email: email }) || await Patient.findOne({ email: email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "Email already registered!, Try again with another one."
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        if (role === 'patient') {
            user = await Patient.create({ name, email, password: hashedPassword, role });
        } else {
            user = await Doctor.create({ name, email, password: hashedPassword, role });
        }
        return res.json({
            success: true,
            message: "Registered Successfully"
        })

    } catch (error) {
        res.json({
            success: false,
            data: user,
            message: error.message
        })
    }
}

const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.json({
                success: false,
                message: "Please provide all fields"
            })
        }
        let existingUser = await Doctor.findOne({ email }) || await Patient.findOne({ email });

        if (!existingUser) {
            return res.json({
                success: false,
                message: "You are not registered!"
            });
        }
        let isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password!"
            });
        }
        const token = generateToken(existingUser);


        return res.json({
            success: true,
            message: "Login successful",
            token: token
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

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



module.exports = { register, login, forgotPassword, resetPassword }

