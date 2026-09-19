const {
    saveBvnVerification
} = require("../models/kyc.model");

const {
    validateBvn
} = require("../integrations/nibss/nibss.kyc");

const verifyBvn = async (customerId, bvn) => {
    const result = await validateBvn(bvn);

    if (!result.valid) {
        const error = new Error("BVN verification failed");
        error.statusCode = 400;
        throw error;
    }

    const kycRecord = await saveBvnVerification(
        customerId,
        bvn
    );

    return {
        nibss: result,
        kyc: kycRecord
    };
};

module.exports = {
    verifyBvn
};