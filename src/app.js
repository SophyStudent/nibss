const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const express = require("express");
const customerRoutes = require("./routes/customer.routes");

const authRoutes = require("./routes/auth.routes");
// const customerRoutes = require("./routes/customer.routes");
// const accountRoutes = require("./routes/account.routes");
// const transactionRoutes = require("./routes/transaction.routes");
// const kycRoutes = require("./routes/kyc.routes");

const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (req, res) => {
    res.json(swaggerSpec);
});

// Register our API routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
// app.use("/api/accounts", accountRoutes);
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/kyc", kycRoutes);

// Central error handler
app.use(errorMiddleware);

module.exports = app;