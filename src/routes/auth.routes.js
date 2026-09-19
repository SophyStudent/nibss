const express = require("express");
const {
    registerCustomer,
    loginCustomer
} = require("../controllers/auth.controller");

const { validateRegistration } = require("../validators/auth.validator");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();


// POST /register → register a new customer
router.post(
    "/register",
    validateRegistration,
    asyncHandler(registerCustomer)
); //validateRegistration middleware added for input validation
// for every async controller that you want the centralized error handler to catch, we wrap it with asyncHandler.

// POST /login → authenticate an existing customer
router.post(
    "/login",
    asyncHandler(loginCustomer)
);

module.exports = router;