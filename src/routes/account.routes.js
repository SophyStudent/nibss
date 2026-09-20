const express = require("express");
const authenticate = require("../middleware/auth.middleware");

const {
    createAccount,
    getAccounts,
    getAccountByNumber
} = require("../controllers/account.controller");

const router = express.Router();

router.post("/", authenticate, createAccount);

router.get("/", authenticate, getAccounts);

router.get(
    "/:accountNumber",
    authenticate,
    getAccountByNumber
);

module.exports = router;