const cors = require('cors');
const middleware = require('./utils/middleware');
const express = require('express');
const app = express();
const winston = require('winston');
const expressWinston = require('express-winston');
const todosRouter = require('./todos/todosController');
const userRouter = require('./users/userController');


if (process.env.NODE_ENV != 'test') {
    app.use(expressWinston.logger({
        transports: [
            new winston.transports.Console()
        ],
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json()
        ),
        meta: true,
        msg: "HTTP {{req.method}} {{req.url}}",
        expressFormat: true,
        colorize: false,
        ignoreRoute: function (req, res) { return false; }
    }));
}

app.use(cors());
app.use(express.json());

app.use('/api/v1/todos', todosRouter);
app.use('/api/v1/', userRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;