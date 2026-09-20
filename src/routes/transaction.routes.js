const express = require("express");
const authenticate = require("../middleware/auth.middleware");

const {
    transfer
} = require("../controllers/transaction.controller");

const router = express.Router();

// Initiate a money transfer
router.post(
    "/transfer",
    authenticate,
    transfer
);

module.exports = router;