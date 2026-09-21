const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const {
    validateBvn,
    validateNin
} = require("../validators/kyc.validator");

const {
    verifyBvn,
    verifyNin,
    getKycStatus
} = require("../controllers/kyc.controller");

const router = express.Router();

// Submit BVN for verification
router.post(
    "/bvn",
    authenticate,
    validateBvn,
    asyncHandler(verifyBvn)
);

// Submit NIN for verification
router.post(
    "/nin",
    authenticate,
    validateNin,
    asyncHandler(verifyNin)
);

// Get the authenticated customer's KYC status
router.get("/status", authenticate, asyncHandler(getKycStatus));

module.exports = router;