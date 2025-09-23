const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { verifyToken } = require("../utils/jwt");


const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.json({
                success: false,
                message: "Please login"
            });
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        let user = await Doctor.findById(decoded.id) || await Patient.findById(decoded.id);
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        req.user = { id: user._id, role: user.role, name: user.name, email: user.email };
        next();
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

const isDoctor = (req, res, next) => {
    if (req.user?.role !== "doctor") {
        return res.json({
            success: false,
            message: "Access denied. Doctors only."
        });
    }
    next();
};

const isPatient = (req, res, next) => {
    if (req.user?.role !== "patient") {
        return res.json({
            success: false,
            message: "Access denied. Patients only."
        });
    }
    next();
};
