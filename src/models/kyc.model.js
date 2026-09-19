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

module.exports = {
    createKycRecord
};