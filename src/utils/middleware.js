const jwt = require('jsonwebtoken');
const config = require('./config');
const httpErrors = require('../httperrors/httpErrors');

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
    if (error instanceof httpErrors.HttpError) {
        res.status(error.statusCode).json(error.data); 
    } else {
        res.sendStatus(500);
    }
};

const authorization = (req, res, next) => {
    const auth = req.headers.authorization;
    if (auth) {
        const token = auth.split(' ')[1];
        jwt.verify(token, config.JWTSECRET, (err, result) => {
            if (err) {
                return res.sendStatus(403);
            }
            // attach the result to the request for further request processing
            req.body.jwtv = result;
            req.body.token = token;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = {
    unknownEndpoint,
    errorHandler,
    authorization,
};