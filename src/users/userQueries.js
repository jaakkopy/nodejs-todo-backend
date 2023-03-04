const createUser = 'INSERT INTO users (email, password) VALUES ($1, $2)';
const findUserByEmail = 'SELECT * FROM users WHERE email = $1';
const updatePassword = 'UPDATE users SET password = $1, updated = CURRENT_DATE WHERE email = $2';

const userQueries = {
    createUser: createUser,
    findUserByEmail: findUserByEmail,
    updatePassword: updatePassword,
};

module.exports = userQueries;