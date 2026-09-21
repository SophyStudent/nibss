const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
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
    asyncHandler(getTransactionHistory)
);

// Get a specific transaction
router.get(
    "/:transactionId",
    authenticate,
    asyncHandler(getTransaction)
);

// Initiate a money transfer
router.post(
    "/transfer",
    authenticate,
    validateTransfer,
    asyncHandler(transfer)
);

module.exports = router;