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

const findTransactionsByCustomerId = async (customerId) => {
    const result = await pool.query(
        `SELECT
            t.id,
            t.transaction_id,
            t.from_account_id,
            t.to_account_number,
            t.amount,
            t.status,
            t.created_at
         FROM transactions t
         INNER JOIN accounts a
            ON t.from_account_id = a.id
         WHERE a.customer_id = $1
         ORDER BY t.created_at DESC`,
        [customerId]
    );

    return result.rows;
};

module.exports = {
    createTransaction,
    findTransactionsByCustomerId
};
