const pool = require("../config/database");

const createAccount = async (
    customerId,
    accountNumber,
    accountType
) => {
    const result = await pool.query(
        `INSERT INTO accounts (
            customer_id,
            account_number,
            account_type
        )
        VALUES ($1, $2, $3)
        RETURNING id, customer_id, account_number, account_type, created_at`,
        [
            customerId,
            accountNumber,
            accountType
        ]
    );

    return result.rows[0];
};

const findAccountsByCustomerId = async (customerId) => {
    const result = await pool.query(
        `SELECT id, customer_id, account_number, account_type, created_at
         FROM accounts
         WHERE customer_id = $1
         ORDER BY created_at DESC`,
        [customerId]
    );

    return result.rows;
};

const findAccountByNumberAndCustomerId = async (
    accountNumber,
    customerId
) => {
    const result = await pool.query(
        `SELECT id, customer_id, account_number, account_type, created_at
         FROM accounts
         WHERE account_number = $1
         AND customer_id = $2`,
        [
            accountNumber,
            customerId
        ]
    );

    return result.rows[0];
};

module.exports = {
    createAccount,
    findAccountsByCustomerId,
    findAccountByNumberAndCustomerId
};