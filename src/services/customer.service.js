const {
    findCustomerById
} = require("../models/customer.model");

const getCustomerById = async (customerId) => {
    return await findCustomerById(customerId);
};

module.exports = {
    getCustomerById
};