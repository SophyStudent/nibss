const {
    verifyBvn: verifyBvnService
} = require("../services/kyc.service");

const verifyBvn = async (req, res) => {
    const { bvn } = req.body;

    const customerId = req.customer.customerId;

    const result = await verifyBvnService(
        customerId,
        bvn
    );

    res.status(200).json({
        message: "BVN verified successfully",
        result
    });
};

const verifyNin = async (req, res) => {
    const { nin } = req.body;

    const customerId = req.customer.customerId;

    res.status(200).json({
        message: "NIN verification request received",
        customerId,
        nin
    });
};

module.exports = {
    verifyBvn,
    verifyNin
};