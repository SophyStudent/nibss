const nibssClient = require("./nibss.client");
const { getNibssToken } = require("./nibss.auth");

const createNibssAccount = async (kycType, kycID, dob) => {
    const token = await getNibssToken();

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
};

module.exports = {
    createNibssAccount
};