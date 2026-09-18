const registerCustomer = async ({ name, email, password }) => {
    // Registration business logic will go here.
    // Database storage will be added when we build the PostgreSQL layer.

    return {
        name,
        email
    };
};

const loginCustomer = async ({ email, password }) => {
    // Login business logic will go here.
    // Password verification and JWT generation will be added later.

    return {
        message: "Login service reached",
        email
    };
};

module.exports = {
    registerCustomer,
    loginCustomer
};