const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const {
    verifyBvn,
    verifyNin
} = require("../controllers/kyc.controller");

const router = express.Router();

// Submit BVN for verification
router.post("/bvn", authenticate, verifyBvn);

// Submit NIN for verification
router.post("/nin", authenticate, verifyNin);

module.exports = router;