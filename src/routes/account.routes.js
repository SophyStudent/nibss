const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const asyncHandler = require("../utils/asyncHandler");

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
    asyncHandler(createAccount)
);

router.get(
    "/",
    authenticate,
    asyncHandler(getAccounts)
);

router.get(
    "/:accountNumber",
    authenticate,
    validateAccountNumber,
    asyncHandler(getAccountByNumber)
);

router.get(
    "/:accountNumber/balance",
    authenticate,
    validateAccountNumber,
    asyncHandler(getAccountBalance)
);

module.exports = router;