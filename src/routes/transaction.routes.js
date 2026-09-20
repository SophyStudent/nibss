const express = require("express");
const authenticate = require("../middleware/auth.middleware");

const {
    transfer,
    getTransactionHistory,
    getTransaction
} = require("../controllers/transaction.controller");

const router = express.Router();

// Get the customer's transaction history
router.get(
    "/",
    authenticate,
    getTransactionHistory
);

// Get a specific transaction
router.get(
    "/:transactionId",
    authenticate,
    getTransaction
);

// Initiate a money transfer
router.post(
    "/transfer",
    authenticate,
    transfer
);

module.exports = router;