const {
    findKycByCustomerId
} = require("../models/kyc.model");

const {
    createAccount: createLocalAccount,
    findAccountsByCustomerId
} = require("../models/account.model");

const {
    createNibssAccount
} = require("../integrations/nibss/nibss.accounts");

const createAccount = async (
    customerId,
    accountType,
    dob
) => {
    const kyc = await findKycByCustomerId(customerId);

    if (!kyc) {
        const error = new Error("KYC verification is required");
        error.statusCode = 400;
        throw error;
    }

    let kycType;
    let kycID;

    if (kyc.bvn_verified) {
        kycType = "BVN";
        kycID = kyc.bvn;
    } else if (kyc.nin_verified) {
        kycType = "NIN";
        kycID = kyc.nin;
    } else {
        const error = new Error(
            "At least one verified KYC method is required"
        );
        error.statusCode = 400;
        throw error;
    }

    const nibssAccount = await createNibssAccount(
        kycType,
        kycID,
        dob
    );

    const account = await createLocalAccount(
        customerId,
        nibssAccount.account.accountNumber,
        accountType
    );

    return {
        nibss: nibssAccount,
        account
    };
};

const getAccounts = async (customerId) => {
    return await findAccountsByCustomerId(customerId);
};

module.exports = {
    createAccount,
    getAccounts
};