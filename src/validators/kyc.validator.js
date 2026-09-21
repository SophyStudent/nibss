const validateBvn = (req, res, next) => {
    const {
        bvn,
        firstName,
        lastName,
        dob,
        phone
    } = req.body;

    if (!bvn || typeof bvn !== "string") {
        return res.status(400).json({
            message: "BVN is required"
        });
    }

    if (!/^\d{11}$/.test(bvn)) {
        return res.status(400).json({
            message: "BVN must contain exactly 11 digits"
        });
    }

    if (!firstName || typeof firstName !== "string") {
        return res.status(400).json({
            message: "First name is required"
        });
    }

    if (!lastName || typeof lastName !== "string") {
        return res.status(400).json({
            message: "Last name is required"
        });
    }

    if (!dob || typeof dob !== "string") {
        return res.status(400).json({
            message: "Date of birth is required"
        });
    }

    if (Number.isNaN(Date.parse(dob))) {
        return res.status(400).json({
            message: "Date of birth must be a valid date"
        });
    }

    if (!phone || typeof phone !== "string") {
        return res.status(400).json({
            message: "Phone number is required"
        });
    }

    next();
};

const validateNin = (req, res, next) => {
    const {
        nin,
        firstName,
        lastName,
        dob
    } = req.body;

    if (!nin || typeof nin !== "string") {
        return res.status(400).json({
            message: "NIN is required"
        });
    }

    if (!/^\d{11}$/.test(nin)) {
        return res.status(400).json({
            message: "NIN must contain exactly 11 digits"
        });
    }

    if (!firstName || typeof firstName !== "string") {
        return res.status(400).json({
            message: "First name is required"
        });
    }

    if (!lastName || typeof lastName !== "string") {
        return res.status(400).json({
            message: "Last name is required"
        });
    }

    if (!dob || typeof dob !== "string") {
        return res.status(400).json({
            message: "Date of birth is required"
        });
    }

    if (Number.isNaN(Date.parse(dob))) {
        return res.status(400).json({
            message: "Date of birth must be a valid date"
        });
    }

    next();
};

module.exports = {
    validateBvn,
    validateNin
};