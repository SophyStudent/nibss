const nibssClient = require("./nibss.client");
const { getNibssToken } = require("./nibss.auth");

const registerBvn = async (
    bvn,
    firstName,
    lastName,
    dob,
    phone
) => {
    const token = await getNibssToken();

    const response = await nibssClient.post(
        "/api/insertBvn",
        {
            bvn,
            firstName,
            lastName,
            dob,
            phone
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const registerNin = async (
    nin,
    firstName,
    lastName,
    dob
) => {
    const token = await getNibssToken();

    const response = await nibssClient.post(
        "/api/insertNin",
        {
            nin,
            firstName,
            lastName,
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

const validateNin = async (nin) => {
    const token = await getNibssToken();

    const response = await nibssClient.post(
        "/api/validateNin",
        {
            nin
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
    registerBvn,
    registerNin,
    validateBvn,
    validateNin
};