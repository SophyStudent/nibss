CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,                         -- Auto-generated unique account record ID
    customer_id INTEGER NOT NULL,                  -- ID of the customer who owns the account
    account_number VARCHAR(10) UNIQUE NOT NULL,    -- Unique 10-digit bank account number
    account_type VARCHAR(20) NOT NULL,             -- Type of account, such as savings or current
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically records creation time

    FOREIGN KEY (customer_id) REFERENCES customers(id)
);