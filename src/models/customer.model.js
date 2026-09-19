const pool = require("../config/database");

const findCustomerByEmail = async (email) => {
    const result = await pool.query(
        `SELECT id, name, email, password_hash, created_at
         FROM customers
         WHERE email = $1`,
        [email]
    );

    return result.rows[0];
};

const createCustomer = async (name, email, passwordHash) => {
    const result = await pool.query(
        `INSERT INTO customers (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name, email, passwordHash]
    );

    return result.rows[0];
};

const findCustomerById = async (customerId) => {
    const result = await pool.query(
        `SELECT id, name, email, created_at
         FROM customers
         WHERE id = $1`,
        [customerId]
    );

    return result.rows[0];
};

module.exports = {
    createCustomer,
    findCustomerByEmail,
    findCustomerById
};