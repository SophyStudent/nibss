const {
    registerCustomer: registerCustomerService,
    loginCustomer: loginCustomerService
} = require("../services/auth.service");

const registerCustomer = async (req, res) => {
    const { name, email, password } = req.body;

    const customer = await registerCustomerService({
        name,
        email,
        password
    });

    res.status(201).json({
        message: "Customer registered successfully",
        customer
    });
};

const loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    const result = await loginCustomerService({
        email,
        password
    });

    res.status(200).json(result);
};

module.exports = {
    registerCustomer,
    loginCustomer
};