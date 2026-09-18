const express = require("express");
const {
    createAccount,
    getAccounts,
    getAccount,
    getBalance
} = require("../controllers/account.controller");

const router = express.Router();

// Create a bank account
router.post("/", createAccount);

// Get the customer's accounts
router.get("/", getAccounts);

// Get a specific account
router.get("/:accountNumber", getAccount);

// Check an account's balance
router.get("/:accountNumber/balance", getBalance);

module.exports = router;