const nibssClient = require("./nibss.client");
const { getNibssToken } = require("./nibss.auth");

const validateBvn = async (bvn) => {
    const token = await getNibssToken();

    const response = await nibssClient.post(
        "/api/validateBvn",
        {
            bvn
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
    validateBvn
};