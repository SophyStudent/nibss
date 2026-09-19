const {
    createKycRecord
} = require("../models/kyc.model");

const createKyc = async (customerId) => {
    return await createKycRecord(customerId);
};

module.exports = {
    createKyc
};