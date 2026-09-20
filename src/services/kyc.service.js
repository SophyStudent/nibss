const {
    saveBvnVerification,
    saveNinVerification,
    findKycByCustomerId
} = require("../models/kyc.model");

const {
    registerBvn,
    registerNin,
    validateBvn,
    validateNin
} = require("../integrations/nibss/nibss.kyc");

const getKycStatus = async (customerId) => {
    const kyc = await findKycByCustomerId(customerId);

    if (!kyc) {
        return {
            bvnVerified: false,
            ninVerified: false
        };
    }

    return {
        bvnVerified: kyc.bvn_verified,
        ninVerified: kyc.nin_verified
    };
};

const verifyBvn = async (
    customerId,
    bvn,
    firstName,
    lastName,
    dob,
    phone
) => {
    // Register the BVN in the simulated NIBSS identity store
    await registerBvn(
        bvn,
        firstName,
        lastName,
        dob,
        phone
    );

    // Then verify the BVN
    const result = await validateBvn(bvn);

    if (!result.success) {
        const error = new Error("BVN verification failed");
        error.statusCode = 400;
        throw error;
    }

    // Save the successful verification in our own database
    const kycRecord = await saveBvnVerification(
        customerId,
        bvn
    );

    return {
        nibss: result,
        kyc: kycRecord
    };
};

const verifyNin = async (
    customerId,
    nin,
    firstName,
    lastName,
    dob
) => {
    // Register the NIN in the simulated NIBSS identity store
    await registerNin(
        nin,
        firstName,
        lastName,
        dob
    );

    // Then verify the NIN
    const result = await validateNin(nin);

    if (!result.response) {
        const error = new Error("NIN verification failed");
        error.statusCode = 400;
        throw error;
    }

    // Save the successful verification in our own database
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
    verifyNin,
    getKycStatus
};