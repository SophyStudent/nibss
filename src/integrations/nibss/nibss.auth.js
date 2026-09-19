const nibssClient = require("./nibss.client");

const getNibssToken = async () => {
    const response = await nibssClient.post("/api/auth/token", {
        apiKey: process.env.NIBSS_API_KEY,
        apiSecret: process.env.NIBSS_API_SECRET
    });

    return response.data.token;
};

module.exports = {
    getNibssToken
};