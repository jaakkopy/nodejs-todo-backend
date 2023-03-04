const createTodosIfNotExists = `CREATE TABLE IF NOT EXISTS todos (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	description TEXT,
	userid INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	created DATE NOT NULL DEFAULT CURRENT_DATE,
	updated DATE NOT NULL DEFAULT CURRENT_DATE,
	status VARCHAR(10) NOT NULL
);`;

const createUsersIfNotExists = `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
	email VARCHAR(320) NOT NULL UNIQUE,
	password TEXT NOT NULL,
	created DATE NOT NULL DEFAULT CURRENT_DATE,
	updated DATE NOT NULL DEFAULT CURRENT_DATE
);`;

// sets up the required tables according to the above 
const setUp = async (db) => {
    try {
        await db.query(createUsersIfNotExists);
        await db.query(createTodosIfNotExists);
    } catch (e) {
        console.error(e, e.stack);
        process.exit(1);
    }
}

module.exports = setUp;