const express = require("express");
const authenticate = require("../middleware/auth.middleware");

const {
    transfer,
    getTransactionHistory
} = require("../controllers/transaction.controller");

const router = express.Router();

// Get the customer's transaction history
router.get(
    "/",
    authenticate,
    getTransactionHistory
);

// Initiate a money transfer
router.post(
    "/transfer",
    authenticate,
    transfer
);

module.exports = router;