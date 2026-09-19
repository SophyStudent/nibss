CREATE TABLE customers (
    id SERIAL PRIMARY KEY,                 -- Auto-generated unique customer ID
    name VARCHAR(100) NOT NULL,            -- Customer name; required
    email VARCHAR(255) UNIQUE NOT NULL,    -- Email; required and cannot be duplicated
    password_hash TEXT NOT NULL,            -- Hashed password; required
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically records creation time
);