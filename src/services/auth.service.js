const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
    createCustomer,
    findCustomerByEmail
} = require("../models/customer.model");

const registerCustomer = async ({ name, email, password }) => {
    const existingCustomer = await findCustomerByEmail(email);

    if (existingCustomer) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 5);

    const customer = await createCustomer(
        name,
        email,
        passwordHash
    );

    return customer;
};

const loginCustomer = async ({ email, password }) => {
    const customer = await findCustomerByEmail(email);

    if (!customer) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatch = await bcrypt.compare(
        password,
        customer.password_hash
    );

    if (!passwordMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            customerId: customer.id,
            email: customer.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        message: "Login successful",
        token
    };
};

module.exports = {
    registerCustomer,
    loginCustomer
};