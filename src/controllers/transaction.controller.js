const {
    transferMoney,
    getTransactionHistory
} = require("../services/transaction.service");

const transfer = async (req, res) => {
    const {
        fromAccount,
        toAccount,
        amount
    } = req.body;

    const customerId = req.customer.customerId;

    const result = await transferMoney(
        customerId,
        fromAccount,
        toAccount,
        amount
    );

    res.status(201).json({
        message: "Transfer successful",
        result
    });
};

const getTransactionHistoryController = async (
    req,
    res
) => {
    const customerId = req.customer.customerId;

    const transactions = await getTransactionHistory(
        customerId
    );

    res.status(200).json({
        transactions
    });
};

module.exports = {
    transfer,
    getTransactionHistory: getTransactionHistoryController
};