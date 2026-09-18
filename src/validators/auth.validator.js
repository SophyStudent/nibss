const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string") {
        return res.status(400).json({
            message: "Name is required and must be text"
        });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({
            message: "A valid email is required"
        });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters"
        });
    }

    next();
};

module.exports = {
    validateRegistration
};