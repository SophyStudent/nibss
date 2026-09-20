const {
    createAccount: createAccountService,
    getAccounts: getAccountsService
} = require("../services/account.service");

const createAccount = async (req, res) => {
    const {
        accountType,
        dob
    } = req.body;

    const customerId = req.customer.customerId;

    const result = await createAccountService(
        customerId,
        accountType,
        dob
    );

    res.status(201).json({
        message: "Account created successfully",
        result
    });
};

const getAccounts = async (req, res) => {
    const customerId = req.customer.customerId;

    const accounts = await getAccountsService(customerId);

    res.status(200).json({
        accounts
    });
};

module.exports = {
    createAccount,
    getAccounts
};