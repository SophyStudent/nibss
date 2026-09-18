const registerCustomer = async ({ name, email, password }) => {
    // Registration business logic will go here.
    // Database storage will be added when we build the PostgreSQL layer.

    return {
        name,
        email
    };
};

module.exports = {
    registerCustomer
};