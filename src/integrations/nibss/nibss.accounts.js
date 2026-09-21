const nibssClient = require("./nibss.client");
const { getNibssToken } = require("./nibss.auth");

const createNibssAccount = async (kycType, kycID, dob) => {
    const token = await getNibssToken();

    try {
        const response = await nibssClient.post(
            "/api/account/create",
            {
                kycType: kycType.toLowerCase(),
                kycID,
                dob
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (err) {
        const status = err.response?.status || 502;
        const nibssMessage = err.response?.data?.message
            || err.response?.data?.error
            || err.message;

        const error = new Error(`NIBSS account creation failed: ${nibssMessage}`);
        error.statusCode = status;
        throw error;
    }
};

const getNibssAccountBalance = async (accountNumber) => {
    const token = await getNibssToken();

    const response = await nibssClient.get(
        `/api/account/balance/${accountNumber}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const nameEnquiry = async (accountNumber) => {
    const token = await getNibssToken();

    const response = await nibssClient.get(
        `/api/account/name-enquiry/${accountNumber}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

module.exports = {
    createNibssAccount,
    getNibssAccountBalance,
    nameEnquiry
};