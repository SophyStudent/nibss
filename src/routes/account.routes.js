const express = require("express");
const authenticate = require("../middleware/auth.middleware");

const {
    createAccount,
    getAccounts
} = require("../controllers/account.controller");

const router = express.Router();

router.post("/", authenticate, createAccount);

router.get("/", authenticate, getAccounts);

module.exports = router;