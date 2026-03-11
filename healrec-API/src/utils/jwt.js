const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jwt.sign(
        { id: user._id, role: user.role, name:user.name },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
