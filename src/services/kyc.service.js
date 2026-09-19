const {
    saveBvnVerification,
    saveNinVerification
} = require("../models/kyc.model");

const {
    validateBvn,
    validateNin
} = require("../integrations/nibss/nibss.kyc");

const verifyBvn = async (customerId, bvn) => {
    const result = await validateBvn(bvn);

    if (!result.success) {
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

const verifyNin = async (customerId, nin) => {
    const result = await validateNin(nin);

    if (!result.response) {
        const error = new Error("NIN verification failed");
        error.statusCode = 400;
        throw error;
    }

    const kycRecord = await saveNinVerification(
        customerId,
        nin
    );

    return {
        nibss: result,
        kyc: kycRecord
    };
};

module.exports = {
    verifyBvn,
    verifyNin
};