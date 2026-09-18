const express = require("express");
const {
    transfer,
    getTransactionHistory,
    getTransaction
} = require("../controllers/transaction.controller");

const router = express.Router();

// Initiate a money transfer
router.post("/transfer", transfer);

// Get the customer's transaction history
router.get("/", getTransactionHistory);

// Get a specific transaction
router.get("/:transactionId", getTransaction);

module.exports = router;