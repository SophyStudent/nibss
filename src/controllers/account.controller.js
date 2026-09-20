const {
    createAccount: createAccountService
} = require("../services/account.service");

const createAccount = async (req, res) => {
    const { dob } = req.body;

    const customerId = req.customer.customerId;

    const result = await createAccountService(
        customerId,
        dob
    );

    res.status(201).json({
        message: "Account created successfully",
        result
    });
};

module.exports = {
    createAccount
};