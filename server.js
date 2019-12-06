const express = require('express');
const helmet = require('helmet');
const projectsRouter = require('./projects/projectsRouter');
const actionsRouter = require('./actions/actionsRouter');
const server = express();

server.use(express.json());

//----------Custom Middleware----------//

//logs to the console the request method, request url, and a timestamp about each request
function logger(req, res, next) {
    console.log(
        `[${new Date().toISOString()}] ${req.method} to ${req.url}`
    )
    next();
}

//----------Implement Custom Middleware----------//
server.use(helmet());
server.use(logger);
server.use('/api/projects', projectsRouter);
server.use('/api/actions', actionsRouter);

//----------Sanity Check----------//
server.get('/', (req, res) => {
    res.send('Project: webapi-challenge is up and running!');
});

module.exports = server;