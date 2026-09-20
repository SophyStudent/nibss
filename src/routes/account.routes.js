const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
    createAccount
} = require("../controllers/account.controller");

const router = express.Router();

// Create a bank account
router.post("/", authenticate, createAccount);

module.exports = router;