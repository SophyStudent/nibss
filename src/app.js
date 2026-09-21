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

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "CSRevolus Bank API Documentation",
        customCssUrl: "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css",
        customJs: [
            "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js",
            "https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js",
        ],
        customCss: `
            .swagger-ui .topbar {
                background-color: #111827;
            }

            .swagger-ui .topbar-wrapper img {
                display: none;
            }

            .swagger-ui .topbar-wrapper::before {
                content: "CSRevolus Bank API";
                color: white;
                font-size: 20px;
                font-weight: 600;
            }

            .swagger-ui .info {
                margin: 30px 0;
            }

            .swagger-ui .info .title {
                font-size: 30px;
            }

            .swagger-ui .opblock {
                border-radius: 8px;
                margin-bottom: 12px;
            }

            .swagger-ui .opblock-summary {
                padding: 12px;
            }

            .swagger-ui .scheme-container {
                box-shadow: none;
            }

            .swagger-ui section.models {
                border-radius: 8px;
            }
        `,
        swaggerOptions: {
            docExpansion: "list",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            displayRequestDuration: true,
            filter: true,
            persistAuthorization: true,
            tryItOutEnabled: false
        }
    })
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