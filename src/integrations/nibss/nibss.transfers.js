const nibssClient = require("./nibss.client");
const { getNibssToken } = require("./nibss.auth");

const transfer = async (
    from,
    to,
    amount
) => {
    const token = await getNibssToken();

    const response = await nibssClient.post(
        "/api/transfer",
        {
            from,
            to,
            amount
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
    transfer
};