const {
    transferMoney
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

module.exports = {
    transfer
};