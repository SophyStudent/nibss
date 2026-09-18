const express = require("express");
const {
    verifyBvn,
    verifyNin
} = require("../controllers/kyc.controller");

const router = express.Router();

// Submit BVN for verification
router.post("/bvn", verifyBvn);

// Submit NIN for verification
router.post("/nin", verifyNin);

module.exports = router;