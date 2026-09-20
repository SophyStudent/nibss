const nibssClient = require("./nibss.client");
const { getNibssToken } = require("./nibss.auth");

const createNibssAccount = async (kycType, kycID, dob) => {
    const token = await getNibssToken();

    console.log("NIBSS account request:", {
        kycType,
        kycID,
        dob
    });

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

       console.log("NIBSS account response:", response.data);

return response.data;

    } catch (error) {
        console.log(
            "NIBSS account creation error:",
            error.response?.data
        );

        throw error;
    }
};

module.exports = {
    createNibssAccount
};