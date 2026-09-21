# CSREVOLUS DIGITAL BANKING SYSTEM

# Using NibssByPhoenix Banking API

A backend banking application built with **Node.js, Express, PostgreSQL, JWT authentication, and the NibssByPhoenix external API**.

The project simulates the backend of a digital banking system. It provides customer authentication, KYC verification, bank account creation, account balance retrieval, money transfers, and transaction management.

The project was developed as a practical backend assignment focused on API development, database integration, authentication, external API integration, validation, and layered backend architecture.

---

## 1. What This Project Does

The application allows a customer to:

* Register an account
* Log in securely
* Access their authenticated profile
* Submit BVN or NIN information for KYC verification
* Check their KYC status
* Create a bank account
* View their accounts
* View account details
* Retrieve their live account balance
* Transfer money to another account
* View transaction history
* View an individual transaction

The application also integrates with the **NibssByPhoenix API** for banking operations such as KYC validation, account creation, balance retrieval, name enquiry, and transfers.

---

# 2. System Architecture

The project uses a layered backend architecture.

Think of the application as a series of responsibilities:

```text
                         CLIENT / FRONTEND
                                │
                                ▼
                         ┌─────────────┐
                         │    ROUTES   │
                         │ Where does  │
                         │ the request │
                         │    go?      │
                         └──────┬──────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MIDDLEWARE    │
                       │ Authentication  │
                       │ Request         │
                       │ Validation      │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   CONTROLLER    │
                       │ Handles HTTP    │
                       │ request/response│
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    SERVICE      │
                       │ Business rules  │
                       │ and application │
                       │     logic       │
                       └───────┬─┬───────┘
                               │ │
                    ┌──────────┘ └──────────┐
                    ▼                       ▼
             ┌──────────────┐       ┌──────────────┐
             │    MODELS    │       │ INTEGRATIONS │
             │ PostgreSQL   │       │   NIBSS API  │
             │ database     │       │              │
             └──────┬───────┘       └──────┬───────┘
                    │                      │
                    ▼                      ▼
             ┌──────────────┐       ┌──────────────┐
             │  SUPABASE    │       │ NibssByPhoenix│
             │  PostgreSQL  │       │ External API │
             └──────────────┘       └──────────────┘
```

### Simple responsibility map

```text
Route
  → Where does the request go?

Middleware
  → Is the user authenticated?
  → Is the request data valid?

Controller
  → Receive HTTP request
  → Call the appropriate service
  → Send HTTP response

Service
  → What should the application actually do?
  → Business rules and application logic

Model
  → How do we access our database?

Integration
  → How do we communicate with NibssByPhoenix?

Database
  → Where is our application's persistent data stored?
```

This separation keeps each part of the application responsible for one major job.

---

# 3. Project Structure

```text
Nibss-Project/
│
├── package.json
├── package-lock.json
├── .env
├── .env.example
├── .gitignore
├── README.md
│
├── docs/
│   └── openapi.yaml
│
├── src/
│   │
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   └── swagger.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── customer.routes.js
│   │   ├── account.routes.js
│   │   ├── transaction.routes.js
│   │   └── kyc.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── customer.controller.js
│   │   ├── account.controller.js
│   │   ├── transaction.controller.js
│   │   └── kyc.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── customer.service.js
│   │   ├── account.service.js
│   │   └── transaction.service.js
│   │
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── account.model.js
│   │   ├── transaction.model.js
│   │   └── kyc.model.js
│   │
│   ├── integrations/
│   │   └── nibss/
│   │       ├── nibss.client.js
│   │       ├── nibss.auth.js
│   │       ├── nibss.kyc.js
│   │       ├── nibss.accounts.js
│   │       └── nibss.transfers.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── account.validator.js
│   │   ├── kyc.validator.js
│   │   └── transaction.validator.js
│   │
│   └── utils/
│       ├── errors.js
│       ├── response.js
│       └── asyncHandler.js
│
├── database/
│   ├── migrations/
│   └── seeds/
│
└── tests/
    ├── auth/
    ├── customers/
    ├── accounts/
    └── transactions/
```

---

# 4. Request Flow

A normal authenticated request moves through the application like this:

```text
Frontend
   │
   │ HTTP request
   ▼
Route
   │
   ▼
Authentication middleware
   │
   ▼
Request validator
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├──────────────► Model ─────► PostgreSQL
   │
   └──────────────► Integration ─────► NibssByPhoenix
   │
   ▼
Controller
   │
   ▼
HTTP response
   │
   ▼
Frontend
```

### Example: Money transfer

```text
POST /api/transactions/transfer
             │
             ▼
       Authenticate
             │
             ▼
      Validate request
             │
             ▼
   Transaction controller
             │
             ▼
    Transaction service
             │
       ┌─────┴─────┐
       ▼           ▼
   Local DB      NIBSS
       │           │
       │      Name enquiry
       │      KYC validation
       │      Transfer
       │           │
       └─────┬─────┘
             ▼
      Save transaction
             │
             ▼
       Return response
```

---

# 5. Assignment Requirements

The application implements the major backend requirements through the following areas.

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/customers/me
```

### Registration

The registration endpoint:

* Accepts customer information
* Validates the request
* Checks whether the customer already exists
* Hashes the password
* Stores the customer in PostgreSQL

### Login

The login endpoint:

* Validates the request
* Finds the customer
* Compares the supplied password with the stored password hash
* Generates a JWT

Protected endpoints require the JWT through the `Authorization` header.

---

# 6. Request Validation

Request validation happens before the request reaches the controller.

```text
Request
   │
   ▼
Validator
   │
   ├── Invalid → 400 response
   │
   └── Valid
        │
        ▼
     Controller
```

The validators check the basic shape and format of incoming data.

### Authentication

```text
/register
  ├── name
  ├── email
  └── password

/login
  ├── email
  └── password
```

### Accounts

```text
POST /api/accounts
  ├── kycType
  ├── kycID
  └── dob
```

Account numbers are validated as 10-digit values.

### KYC

```text
POST /api/kyc/bvn
  ├── bvn
  ├── firstName
  ├── lastName
  ├── dob
  └── phone

POST /api/kyc/nin
  ├── nin
  ├── firstName
  ├── lastName
  └── dob
```

BVN and NIN are validated as 11-digit values.

### Transfers

```text
POST /api/transactions/transfer
  ├── fromAccount
  ├── toAccount
  └── amount
```

Account numbers must contain 10 digits and the transfer amount must be greater than zero.

---

# 7. KYC

The application supports BVN and NIN verification through the external NibssByPhoenix API.

```text
Customer
   │
   ├── BVN
   │    └── NibssByPhoenix
   │
   └── NIN
        └── NibssByPhoenix
```

Endpoints:

```text
POST /api/kyc/bvn
POST /api/kyc/nin
GET  /api/kyc/status
```

The application stores the customer's KYC state locally in PostgreSQL.

The backend uses this local state when determining whether the customer has completed the required verification.

---

# 8. Accounts

Customers can create and retrieve bank accounts.

```text
POST /api/accounts
GET  /api/accounts
GET  /api/accounts/:accountNumber
GET  /api/accounts/:accountNumber/balance
```

Account creation uses verified KYC information and communicates with NibssByPhoenix.

The locally stored account is associated with the authenticated customer.

### Account relationship

```text
Customer
   │
   ├── Account
   │
   ├── Account
   │
   └── Account
```

This represents a **one-to-many relationship** between customers and accounts.

---

# 9. Account Balance

The balance endpoint retrieves the customer's account balance from NibssByPhoenix.

```text
Customer
   │
   ▼
GET /api/accounts/:accountNumber/balance
   │
   ▼
Check account ownership
   │
   ▼
NibssByPhoenix
   │
   ▼
Live balance
   │
   ▼
Frontend
```

The backend therefore does not treat an old locally stored balance as the authoritative live balance.

---

# 10. Money Transfers

Transfers are handled through the NibssByPhoenix integration.

```text
POST /api/transactions/transfer
```

The transfer process includes:

```text
1. Authenticate customer
2. Validate request
3. Verify sender account ownership
4. Check KYC
5. Validate KYC with NIBSS
6. Perform recipient name enquiry
7. Submit transfer to NIBSS
8. Receive transfer reference/status
9. Store transaction locally
10. Return the result
```

A successful transfer produces a transaction record containing information such as:

* Transaction ID/reference
* Sender account
* Recipient account
* Amount
* Status
* Creation time

---

# 11. Transactions

The application provides:

```text
GET /api/transactions
GET /api/transactions/:transactionId
```

The transaction history is retrieved from PostgreSQL and is associated with the authenticated customer.

The individual transaction endpoint also checks customer ownership before returning the transaction.

---

# 12. Database

The project uses **PostgreSQL through Supabase**.

Main tables:

```text
CUSTOMERS
    │
    ├──────────────┐
    │              │
    ▼              ▼
 ACCOUNTS         KYC
    │
    │
    ▼
TRANSACTIONS
```

### Customers

Stores customer identity and authentication information.

### Accounts

Stores customer bank accounts.

Relationship:

```text
customers.id
     │
     ▼
accounts.customer_id
```

### KYC

Stores BVN/NIN information and verification state.

Relationship:

```text
customers.id
     │
     ▼
kyc.customer_id
```

### Transactions

Stores transfers initiated from local customer accounts.

Relationship:

```text
accounts.id
     │
     ▼
transactions.from_account_id
```

The recipient is stored as an account number because the recipient may be outside the local customer's accounts.

---

# 13. External API Integration

The project communicates with the external:

**NibssByPhoenix API**

The integration is isolated under:

```text
src/integrations/nibss/
```

```text
nibss/
│
├── nibss.client.js
│      └── Axios client / base configuration
│
├── nibss.auth.js
│      └── NIBSS authentication
│
├── nibss.kyc.js
│      └── BVN/NIN operations
│
├── nibss.accounts.js
│      └── Account/balance/name enquiry
│
└── nibss.transfers.js
       └── Money transfers
```

This keeps external API communication separate from the application's internal business logic.

---

# 14. Authentication Architecture

There are two separate authentication contexts.

```text
Our Application
      │
      ▼
Customer JWT
      │
      └── Protects our API endpoints


Our Backend
      │
      ▼
NIBSS Authentication
      │
      └── Allows our backend to communicate
          with NibssByPhoenix
```

The customer's JWT and the NIBSS JWT serve different purposes and are not interchangeable.

---

# 15. Swagger API Documentation

The project includes OpenAPI documentation.

Swagger UI:

```text
/api-docs
```

OpenAPI JSON:

```text
/api-docs.json
```

When the server is running locally:

```text
http://localhost:3000/api-docs
```

Swagger provides an interactive way to inspect and test the API endpoints.

---

# 16. Environment Variables

Create a `.env` file in the project root.

Required configuration includes:

```env
PORT=3000

DATABASE_URL=your_supabase_postgresql_connection_string

JWT_SECRET=your_application_jwt_secret

NIBSS_BASE_URL=your_nibss_base_url
NIBSS_API_KEY=your_nibss_api_key
NIBSS_API_SECRET=your_nibss_api_secret
```

Never commit `.env` to GitHub.

The project uses `.env.example` to document the required configuration without exposing secrets.

---

# 17. Installation

Clone the project and install dependencies:

```bash
npm install
```

Create the required `.env` file.

Then run the database migrations:

```bash
npm run migrate
```

Start the development server:

```bash
npm run dev
```

The API will run on the configured port.

---

# 18. Useful Commands

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Run database migrations

```bash
npm run migrate
```

---

# 19. Frontend and InstantDemo

The project also has a frontend experience.

The frontend contains an **InstantDemo** preview section intended for demonstrating the application experience.

The InstantDemo should remain conceptually separate from authenticated customer data.

```text
                 FRONTEND
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     InstantDemo       Authenticated
       Preview            Customer
          │                   │
    Demo/preview data    Real backend data
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                 Accounts   Balance   Transactions
```

The authenticated customer experience should use the backend as the source of truth for financial information.

---

# 20. Security Considerations

The project currently includes:

* JWT authentication
* Password hashing with bcrypt
* Protected routes
* Customer ownership checks
* Environment variables for secrets
* Input/request validation
* Separation of customer authentication from NIBSS authentication

The project is an educational banking backend and is not intended to be used as a production banking system without additional security, reliability, transaction, monitoring, and compliance controls.

---

# 21. Current API Map

```text
/api
│
├── /auth
│   ├── POST /register
│   └── POST /login
│
├── /customers
│   └── GET /me
│
├── /kyc
│   ├── POST /bvn
│   ├── POST /nin
│   └── GET /status
│
├── /accounts
│   ├── POST /
│   ├── GET /
│   ├── GET /:accountNumber
│   └── GET /:accountNumber/balance
│
└── /transactions
    ├── POST /transfer
    ├── GET /
    └── GET /:transactionId
```

---

# 22. Overall System Map

The entire application can be understood as:

```text
                         BANKING APPLICATION
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        AUTHENTICATION          KYC              BANKING
              │                   │                   │
       Register/Login       BVN / NIN          Accounts
              │                   │              Balance
              │                   │             Transfers
              │                   │            Transactions
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  ▼
                           BUSINESS SERVICES
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
              PostgreSQL                  NibssByPhoenix
              / Supabase                    External API
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                              RESPONSE
                                  │
                                  ▼
                              FRONTEND
```

---

# 23. Project Goal

The main goal of this project is to demonstrate how a structured backend application can combine:

```text
REST API
   +
Express
   +
Authentication
   +
Request Validation
   +
PostgreSQL
   +
Business Logic
   +
External API Integration
   +
Swagger/OpenAPI
   +
Frontend Integration
```

The project provides a practical foundation for progressing into more advanced backend concepts such as database transactions, atomic operations, idempotency, advanced banking business rules, security hardening, and automated testing.
