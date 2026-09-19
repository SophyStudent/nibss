const { getCustomerById } = require("../services/customer.service");

const getCustomerProfile = async (req, res) => {
    const customer = await getCustomerById(req.customer.customerId);

    if (!customer) {
        return res.status(404).json({
            message: "Customer not found"
        });
    }

    res.status(200).json({
        customer
    });
};

module.exports = {
    getCustomerProfile
};