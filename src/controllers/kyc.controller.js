const verifyBvn = async (req, res) => {
    const { bvn } = req.body;

    const customerId = req.customer.customerId;

    res.status(200).json({
        message: "BVN verification request received",
        customerId,
        bvn
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