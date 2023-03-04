require('dotenv').config();

// port given in environment or 3000 if thats undefined
const PORT = process.env.PORT || 3000;
const JWTSECRET = process.env.JWTSECRET;

module.exports = {
    PORT,
    JWTSECRET
};