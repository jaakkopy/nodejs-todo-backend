# About

This is my take on an assignment given by [integrify](https://www.integrify.io/). Thank you to integrify for the fun assignment.
The application in question is a nodejs backend for a TODO application.

The .env is left in intentionally such that the JWT secret, which is defined in the file is ready to go for anyone interested in cloning this repo. This is only for convenience reasons; its not secure.

The tools used:
- **Language**: JavaScript
- **Framework**: ExpressJS
- **Database**: PostgreSQL

# How to run

1. Clone the repo:
```
git clone https://github.com/jake52227/nodejs-todo-backend.git
```
2. Create a database for the backend:
```
createdb todosdb
```

Now the backend can be started from the root directory of the project with:
```
npm start
```
The tests can be run with:
```
npm test
```
Note: If the tests are run with a fresh database (new database, uninitialized tables) before the server is ever started with `npm start`, the tests might fail on the first run because the 'users' table is not ready (for some reason). This issue won't be a problem after the database is fully ready with subsequent test runs.