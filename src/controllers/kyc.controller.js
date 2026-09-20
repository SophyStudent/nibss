const {
    verifyBvn: verifyBvnService,
    verifyNin: verifyNinService
} = require("../services/kyc.service");

const verifyBvn = async (req, res) => {
    const {
        bvn,
        firstName,
        lastName,
        dob,
        phone
    } = req.body;

    const customerId = req.customer.customerId;

    const result = await verifyBvnService(
        customerId,
        bvn,
        firstName,
        lastName,
        dob,
        phone
    );

    res.status(200).json({
        message: "BVN verified successfully",
        result
    });
};

const verifyNin = async (req, res) => {
    const {
        nin,
        firstName,
        lastName,
        dob
    } = req.body;

    const customerId = req.customer.customerId;

    const result = await verifyNinService(
        customerId,
        nin,
        firstName,
        lastName,
        dob
    );

    res.status(200).json({
        message: "NIN verified successfully",
        result
    });
};

module.exports = {
    verifyBvn,
    verifyNin
};