const express = require("express");
const {
    registerCustomer,
    loginCustomer
} = require("../controllers/auth.controller");

const { validateRegistration } = require("../validators/auth.validator");
const router = express.Router();

// POST /register → register a new customer
router.post("/register", validateRegistration, registerCustomer); //validateRegistration middleware added for input validation

// POST /login → authenticate an existing customer
router.post("/login", loginCustomer);

module.exports = router;