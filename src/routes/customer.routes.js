const express = require("express");
const { getCustomerProfile } = require("../controllers/customer.controller");

const router = express.Router();

// GET /me → get the logged-in customer's profile
router.get("/me", getCustomerProfile);

module.exports = router;