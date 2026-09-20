const pool = require("../config/database");

const createKycRecord = async (customerId) => {
    const result = await pool.query(
        `INSERT INTO kyc (customer_id)
         VALUES ($1)
         RETURNING id, customer_id, bvn, nin, bvn_verified, nin_verified`,
        [customerId]
    );

    return result.rows[0];
};

const saveBvnVerification = async (customerId, bvn) => {
    const result = await pool.query(
        `INSERT INTO kyc (
            customer_id,
            bvn,
            bvn_verified
        )
        VALUES ($1, $2, TRUE)
        ON CONFLICT (customer_id)
        DO UPDATE SET
            bvn = EXCLUDED.bvn,
            bvn_verified = TRUE,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id, customer_id, bvn, nin, bvn_verified, nin_verified`,
        [customerId, bvn]
    );

    return result.rows[0];
};

const saveNinVerification = async (customerId, nin) => {
    const result = await pool.query(
        `INSERT INTO kyc (
            customer_id,
            nin,
            nin_verified
        )
        VALUES ($1, $2, TRUE)
        ON CONFLICT (customer_id)
        DO UPDATE SET
            nin = EXCLUDED.nin,
            nin_verified = TRUE,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id, customer_id, bvn, nin, bvn_verified, nin_verified`,
        [customerId, nin]
    );

    return result.rows[0];
};

const findKycByCustomerId = async (customerId) => {
    const result = await pool.query(
        `SELECT id, customer_id, bvn, nin, bvn_verified, nin_verified
         FROM kyc
         WHERE customer_id = $1`,
        [customerId]
    );

    return result.rows[0];
};

module.exports = {
    createKycRecord,
    saveBvnVerification,
    saveNinVerification,
    findKycByCustomerId
};