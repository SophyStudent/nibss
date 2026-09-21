const path = require("path");
const swaggerUiDist = require("swagger-ui-dist");

const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");

const express = require("express");

const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");

const authRoutes = require("./routes/auth.routes");

// const customerRoutes = require("./routes/customer.routes");

const accountRoutes = require("./routes/account.routes");

const transactionRoutes = require("./routes/transaction.routes");

const kycRoutes = require("./routes/kyc.routes");

const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/api-docs/swagger-ui-bundle.js", (req, res) => {
    res.sendFile(
        path.join(
            swaggerUiDist.getAbsoluteFSPath(),
            "swagger-ui-bundle.js"
        )
    );
});

app.get("/api-docs/swagger-ui-standalone-preset.js", (req, res) => {
    res.sendFile(
        path.join(
            swaggerUiDist.getAbsoluteFSPath(),
            "swagger-ui-standalone-preset.js"
        )
    );
});

app.get("/api-docs/swagger-ui.css", (req, res) => {
    res.sendFile(
        path.join(
            swaggerUiDist.getAbsoluteFSPath(),
            "swagger-ui.css"
        )
    );
});

app.get("/api-docs/favicon-32x32.png", (req, res) => {
    res.sendFile(
        path.join(
            swaggerUiDist.getAbsoluteFSPath(),
            "favicon-32x32.png"
        )
    );
});

app.get("/api-docs/favicon-16x16.png", (req, res) => {
    res.sendFile(
        path.join(
            swaggerUiDist.getAbsoluteFSPath(),
            "favicon-16x16.png"
        )
    );
});

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);


app.get("/api-docs.json", (req, res) => {
    res.json(swaggerSpec);
});

// Register our API routes

app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/accounts", accountRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/kyc", kycRoutes);

// Central error handler

app.use(errorMiddleware);

module.exports = app;