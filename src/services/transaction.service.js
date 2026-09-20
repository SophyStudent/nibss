const {
    findKycByCustomerId
} = require("../models/kyc.model");

const {
    findAccountByNumberAndCustomerId,
    findAccountByNumber
} = require("../models/account.model");

const {
    validateBvn,
    validateNin
} = require("../integrations/nibss/nibss.kyc");

const {
    nameEnquiry
} = require("../integrations/nibss/nibss.accounts");

const {
    transfer
} = require("../integrations/nibss/nibss.transfers");

const {
    createTransaction
} = require("../models/transaction.model");

const transferMoney = async (
    customerId,
    fromAccountNumber,
    toAccountNumber,
    amount
) => {
    const sender = await findAccountByNumberAndCustomerId(
        fromAccountNumber,
        customerId
    );

    if (!sender) {
        const error = new Error("Sender account not found");
        error.statusCode = 404;
        throw error;
    }

if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    const error = new Error("Amount must be greater than zero");
    error.statusCode = 400;
    throw error;
}

amount = Number(amount);

const kyc = await findKycByCustomerId(customerId);

if (!kyc) {
    const error = new Error("KYC verification is required");
    error.statusCode = 400;
    throw error;
}

if (kyc.bvn_verified) {
    await validateBvn(kyc.bvn);
} else if (kyc.nin_verified) {
    await validateNin(kyc.nin);
} else {
    const error = new Error(
        "At least one verified KYC method is required"
    );
    error.statusCode = 400;
    throw error;
}

const recipient = await nameEnquiry(
    toAccountNumber
);

if (!recipient) {
    const error = new Error("Recipient account not found");
    error.statusCode = 404;
    throw error;
}

const nibssTransfer = await transfer(
    fromAccountNumber,
    toAccountNumber,
    amount
);

if (!nibssTransfer.reference) {
    const error = new Error(
        "Transfer was not completed"
    );
    error.statusCode = 502;
    throw error;
}

const transaction = await createTransaction(
    nibssTransfer.reference,
    sender.id,
    toAccountNumber,
    amount,
    nibssTransfer.status
);

return {
    transaction,
    nibss: nibssTransfer
};

};

module.exports = {
    transferMoney
};
