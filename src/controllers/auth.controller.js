const registerCustomer = (req, res) => {
    const { name, email, password } = req.body;

    res.status(201).json({
        message: "Customer registration received",
        customer: {
            name,
            email
        }
    });
};

module.exports = {
    registerCustomer
};