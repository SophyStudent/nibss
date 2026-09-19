const axios = require("axios");

const nibssClient = axios.create({
    baseURL: process.env.NIBSS_BASE_URL
});

module.exports = nibssClient;