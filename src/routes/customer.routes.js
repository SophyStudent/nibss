const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const {
    getCustomerProfile
} = require("../controllers/customer.controller");

const router = express.Router();

// Get the authenticated customer's profile
router.get("/me", authenticate, getCustomerProfile);

module.exports = router;