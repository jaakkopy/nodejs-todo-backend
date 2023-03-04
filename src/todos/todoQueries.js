const getAllByUserId = 'SELECT * FROM todos WHERE userid = $1';
const getAllByStatusAndUserId = 'SELECT * FROM todos WHERE status = $1 AND userid = $2';
const updateById = 'UPDATE todos SET name = $1, description = $2, updated = CURRENT_DATE, status = $3 WHERE id = $4 AND userid = $5';
const deleteById = 'DELETE FROM todos WHERE id = $1 AND userid = $2';
const createNew = 'INSERT INTO todos (name, description, userid, status) VALUES ($1, $2, $3, $4)';
const getLatestOfUser = 'SELECT * FROM todos WHERE userid = $1 ORDER BY id DESC LIMIT 1';
const getOneById = 'SELECT * FROM todos WHERE id = $1 AND userid = $2';

const todoQueries = {
    getAllByUserId: getAllByUserId,
    getAllByStatusAndUserId: getAllByStatusAndUserId,
    updateById: updateById,
    deleteById: deleteById,
    createNew: createNew,
    getLatestOfUser: getLatestOfUser,
    getOneById: getOneById
};

module.exports = todoQueries;