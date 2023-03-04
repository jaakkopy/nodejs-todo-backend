const userRouter = require('express').Router();
const userService = require('./userService');
const middleware = require('../utils/middleware');

//POST */api/v1/signup*: Sign up as an user of the system, using email & password
// If the sign up was successfull, sign the user in and return the token
userRouter.post('/signup', async (req, res, next) => {
    try {
        await userService.signUp(req.body);
        const token = await userService.signIn(req.body); 
        res.status(201).json(token);
    } catch(e) {
        next(e);
    }
});

//POST */api/v1/signin*: Sign in using email & password. The system will return the JWT token that can be used to call the APIs that follow
userRouter.post('/signin', async (req, res, next) => {
    try {
        const token = await userService.signIn(req.body); 
        res.status(200).json(token);
    } catch(e) {
        next(e);
    }
});

//**PUT** */api/v1/changePassword*: Change user’s password
userRouter.put('/changePassword', middleware.authorization, async (req, res, next) => {
    try {
        await userService.updatePassword(req.body);
        res.status(200).send();
    } catch(e) {
        next(e);
    }
});


module.exports = userRouter;