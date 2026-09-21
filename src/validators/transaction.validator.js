const validateTransfer = (req, res, next) => {
    const {
        fromAccount,
        toAccount,
        amount
    } = req.body;

    if (!fromAccount || typeof fromAccount !== "string") {
        return res.status(400).json({
            message: "Sender account number is required"
        });
    }

    if (!/^\d{10}$/.test(fromAccount)) {
        return res.status(400).json({
            message: "Sender account number must contain exactly 10 digits"
        });
    }

    if (!toAccount || typeof toAccount !== "string") {
        return res.status(400).json({
            message: "Recipient account number is required"
        });
    }

    if (!/^\d{10}$/.test(toAccount)) {
        return res.status(400).json({
            message: "Recipient account number must contain exactly 10 digits"
        });
    }

    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        return res.status(400).json({
            message: "Amount is required"
        });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than zero"
        });
    }

    next();
};

module.exports = {
    validateTransfer
};