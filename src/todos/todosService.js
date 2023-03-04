const db = require('../db/db');
const todoQueries = require('./todoQueries');
const httpErrors = require('../httperrors/httpErrors');

const TODOSTATUS = {
    NotStarted: 'NotStarted', 
    OnGoing: 'OnGoing', 
    Completed: 'Completed'
};

const checkId = (id) => {
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
        throw new httpErrors.HttpBadRequest(undefined, {reason: 'Id should be a number'});
    }
    return idNum;
}

// check that the user actually owns the todo they wish to handle
const verifyTodoOwner = async (todoid, userid) => {
    const { rows } = await db.query(todoQueries.getOneById, [todoid, userid]);
    if (rows.length == 0) {
        throw new httpErrors.HttpForbidden(undefined, {reason: 'Not owner of todo, or todo does not exist'});
    }
}

// check that the request's user id and the token's user id match
const verifyRequester = async (requestUserId, tokenUserId) => {
    if (requestUserId !== tokenUserId) {
        throw new httpErrors.HttpForbidden(undefined, {reason: 'Need ownership of a todo to handle it'});
    }
}

// GET /api/v1/todos: Get all todos 
// only return the user's own todos
const getAllByUserId = async (body) => {
    const userId = checkId(body.jwtv.id);
    const { rows } = await db.query(todoQueries.getAllByUserId, [userId]);
    return rows;
}

// GET /api/v1/todos?status=[status]: Get a list of todo items by state
const getAllByStatus = async (status, body) => {
    if (!(status in TODOSTATUS)) {
        throw new httpErrors.HttpBadRequest(undefined, {reason: 'not a valid status'}); 
    }
    const userId = checkId(body.jwtv.id);
    const { rows } = await db.query(todoQueries.getAllByStatusAndUserId, [status, userId]);
    return rows;
}

// POST /api/v1/todos: Create a new todo item
const createNew = async (body) => {
    const userid = checkId(body.userid);
    const tokenUserId = checkId(body.jwtv.id);
    await verifyRequester(userid, tokenUserId);    
    const name = body.name;
    const description = body?.description; 
    const status = body.status;
    await db.query(todoQueries.createNew, [name, description, userid, status]);
    const { rows } = await db.query(todoQueries.getLatestOfUser, [userid]);
    return rows[0];
}

// PUT /api/v1/todos/:id: Update a todo item
const updateById = async (todoId, body) => {
    const idNum = checkId(todoId);
    const userid = checkId(body.jwtv.id);
    await verifyTodoOwner(idNum, userid);
    await verifyRequester(checkId(body.userid), userid);    
    const name = body.name;
    const description = body?.description; 
    const status = body.status; 
    await db.query(todoQueries.updateById, [name, description, status, idNum, userid]);
    const { rows } = await db.query(todoQueries.getOneById, [idNum, userid]);
    return rows[0];
}

// DELETE /api/v1/todos/:id: Delete a todo item
const deleteById = async (todoId, body) => {
    const idNum = checkId(todoId);
    const userid = checkId(body.jwtv.id);
    await verifyTodoOwner(idNum, userid);
    await db.query(todoQueries.deleteById, [idNum, userid]);
}

const todossService = {
    getAllByUserId: getAllByUserId,
    getAllByStatus: getAllByStatus,
    createNew: createNew,
    updateById: updateById,
    deleteById: deleteById
};

module.exports = todossService;