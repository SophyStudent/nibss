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

module.exports = {
    createAccount
};