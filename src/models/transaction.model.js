const pool = require("../config/database");

const createTransaction = async (
    transactionId,
    fromAccountId,
    toAccountNumber,
    amount,
    status
) => {
    const result = await pool.query(
        `INSERT INTO transactions (
            transaction_id,
            from_account_id,
            to_account_number,
            amount,
            status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            transaction_id,
            from_account_id,
            to_account_number,
            amount,
            status,
            created_at`,
        [
            transactionId,
            fromAccountId,
            toAccountNumber,
            amount,
            status
        ]
    );

    return result.rows[0];
};

module.exports = {
    createTransaction
};