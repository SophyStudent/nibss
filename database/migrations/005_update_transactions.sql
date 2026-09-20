ALTER TABLE transactions
DROP CONSTRAINT transactions_to_account_id_fkey;

ALTER TABLE transactions
DROP COLUMN to_account_id;

ALTER TABLE transactions
ADD COLUMN to_account_number VARCHAR(10) NOT NULL;