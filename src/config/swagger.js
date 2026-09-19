const fs = require("fs");
const path = require("path");
const yaml = require("yaml");

const filePath = path.join(__dirname, "../../docs/openapi.yaml");

const fileContent = fs.readFileSync(filePath, "utf8");

const swaggerSpec = yaml.parse(fileContent);

module.exports = swaggerSpec;