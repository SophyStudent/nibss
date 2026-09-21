const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
    validateCreateAccount,
    validateAccountNumber
} = require("../validators/account.validator");

const {
    createAccount,
    getAccounts,
    getAccountByNumber,
    getAccountBalance
} = require("../controllers/account.controller");

const router = express.Router();

router.post(
    "/",
    authenticate,
    validateCreateAccount,
    createAccount
);

router.get(
    "/",
    authenticate,
    getAccounts
);

router.get(
    "/:accountNumber",
    authenticate,
    validateAccountNumber,
    getAccountByNumber
);

router.get(
    "/:accountNumber/balance",
    authenticate,
    validateAccountNumber,
    getAccountBalance
);

module.exports = router;