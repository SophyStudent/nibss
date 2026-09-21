const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const {
    getCustomerProfile
} = require("../controllers/customer.controller");

const router = express.Router();

// Get the authenticated customer's profile
router.get("/me", authenticate, asyncHandler(getCustomerProfile));

module.exports = router;