const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const {
    validateTransfer
} = require("../validators/transaction.validator");


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
    validateTransfer,
    transfer
);

module.exports = router;