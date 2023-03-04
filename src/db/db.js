const {Pool} = require('pg');
const setUp = require('./dbSetup');

/* 
Note: the rest of the parameters are taken automatically from the environment. These include:
PGHOST=localhost
PGUSER=process.env.USER
PGPASSWORD=null
PGPORT=5432
*/
const configurationInfo = {
    database: "todosdb"
};

const db = new Pool(configurationInfo);
setUp(db);

module.exports = db;