const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const db = require('../db/db');
const userQueries = require('./userQueries');
const config = require('../utils/config');
const httpErrors = require('../httperrors/httpErrors');

const validateArguments = (email, password) => {
    if (!email || !password|| !emailValidator.validate(email))
        throw new httpErrors.HttpBadRequest(undefined, {reason: 'Email or password is not valid'});  
};

const getUser = async (email) => {
    const { rows } = await db.query(userQueries.findUserByEmail, [email]);
    const userInfo = rows[0];
    if (!userInfo) {
        throw new httpErrors.HttpNotFound(undefined, {reason: 'No such user'}); 
    }
    return userInfo;
};

const compareToHash = async (actualPasswordHash, givenPassword) => {
    const correct = await bcrypt.compare(givenPassword, actualPasswordHash);
    if (!correct) {
        throw new httpErrors.HttpForbidden(undefined, {reason: 'Incorrect password'});
    }
}

const verifyRequesterEmail = (requestEmail, tokenEmail) => {
    if (requestEmail !== tokenEmail) {
        throw new httpErrors.HttpForbidden(undefined, {reason: 'Can only handle own information'});
    }
}

// POST /api/v1/signup: Sign up as an user of the system, using email & password
const signUp = async (body) => {
    const email = body.email; 
    const password = body.password;
    validateArguments(email, password);
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(password, salt);
    await db.query(userQueries.createUser, [email, hashed]);     
};

// POST /api/v1/signin: Sign in using email & password. The system will return the JWT token that can be used to call the APIs that follow
const signIn = async (body) => {
    const email = body.email;
    const password = body.password;
    validateArguments(email, password);
    const userInfo = await getUser(email);
    const hash = userInfo.password;
    await compareToHash(hash, password); 
    const token = jwt.sign(userInfo, config.JWTSECRET, {expiresIn: 60*60});
    return {token};
};

// PUT /api/v1/changePassword: Change user’s password
const updatePassword = async (body) => {
    const email = body.email;
    const newPassword = body.password;
    validateArguments(email, newPassword);
    verifyRequesterEmail(email, body.jwtv.email);
    await db.query(userQueries.updatePassword, [newPassword, email]);
};

const userService = {
    signUp: signUp,
    signIn: signIn,
    updatePassword: updatePassword,
};

module.exports = userService;