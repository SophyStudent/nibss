const validateCreateAccount = (req, res, next) => {
    const {
        kycType,
        kycID,
        dob
    } = req.body;

    if (!kycType || typeof kycType !== "string") {
        return res.status(400).json({
            message: "KYC type is required"
        });
    }

    if (!["bvn", "nin"].includes(kycType.toLowerCase())) {
        return res.status(400).json({
            message: "KYC type must be bvn or nin"
        });
    }

    if (!kycID || typeof kycID !== "string") {
        return res.status(400).json({
            message: "KYC ID is required"
        });
    }

    if (!/^\d{11}$/.test(kycID)) {
        return res.status(400).json({
            message: "KYC ID must contain exactly 11 digits"
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

const validateAccountNumber = (req, res, next) => {
    const {
        accountNumber
    } = req.params;

    if (!accountNumber || !/^\d{10}$/.test(accountNumber)) {
        return res.status(400).json({
            message: "Account number must contain exactly 10 digits"
        });
    }

    next();
};

module.exports = {
    validateCreateAccount,
    validateAccountNumber
};