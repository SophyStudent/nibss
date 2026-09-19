CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,                              -- Auto-generated internal transaction ID
    transaction_id VARCHAR(100) UNIQUE NOT NULL,       -- Public transaction reference
    from_account_id INTEGER NOT NULL,                  -- Account sending the money
    to_account_id INTEGER NOT NULL,                    -- Account receiving the money
    amount NUMERIC(15,2) NOT NULL,                     -- Amount transferred
    status VARCHAR(20) NOT NULL,                       -- Transaction status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Automatically records creation time

    FOREIGN KEY (from_account_id) REFERENCES accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(id)
);