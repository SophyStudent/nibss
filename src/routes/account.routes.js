const express = require("express");
const authenticate = require("../middleware/auth.middleware");

const {
    createAccount,
    getAccounts,
    getAccountByNumber,
    getAccountBalance
} = require("../controllers/account.controller");

const router = express.Router();

router.post("/", authenticate, createAccount);

router.get("/", authenticate, getAccounts);

router.get(
    "/:accountNumber",
    authenticate,
    getAccountByNumber
);

router.get(
    "/:accountNumber/balance",
    authenticate,
    getAccountBalance
);

module.exports = router;