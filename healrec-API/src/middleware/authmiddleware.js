const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");
const { verifyToken } = require("../utils/jwt");

const isLoggedIn = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please login"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const user =
            (await Doctor.findById(decoded.id)) ||
            (await Patient.findById(decoded.id));

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        req.user = {
            _id: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        };

        next();
    } catch (error) {
        console.error("[authmiddleware] error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

const isDoctor = (req, res, next) => {
    if (req.user.role !== "doctor") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Doctors only."
        });
    }
    next();
};

const isPatient = (req, res, next) => {
    if (req.user.role !== "patient") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Patients only."
        });
    }
    next();
};

module.exports = { isLoggedIn, isPatient, isDoctor };
