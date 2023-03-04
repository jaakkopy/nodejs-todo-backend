const todosRouter = require('express').Router();
const todossService = require('./todosService');
const middleware = require('../utils/middleware');

/*
/api/v1/todos?status=[status]: Get a list of todo items. 
Optionally, a status query param can be included to return only 
items of specific status. If not present, return all items
*/
todosRouter.get('/', middleware.authorization, async (req, res, next) => {
    try {
        const status = req.query.status;    
        const serviceResponse = status ? 
            await todossService.getAllByStatus(status, req.body) :
            await todossService.getAllByUserId(req.body);
        res.status(200).json(serviceResponse);
    } catch(e) {
        next(e);
    }
});

// POST /api/v1/todos: Create a new todo item
todosRouter.post('/', middleware.authorization, async (req, res, next) => {
    try {
        const addedTodo = await todossService.createNew(req.body);
        res.status(201).json(addedTodo);
    } catch(e) {
        next(e);
    }
});

// PUT /api/v1/todos/:id: Update a todo item
todosRouter.put('/:id', middleware.authorization, async (req, res, next) => {
    try {
        const todoId = req.params.id;
        const updatedTodo = await todossService.updateById(todoId, req.body); 
        res.status(200).json(updatedTodo);
    } catch(e) {
        next(e);
    }
});

// DELETE /api/v1/todos/:id: Delete a todo item
todosRouter.delete('/:id', middleware.authorization, async (req, res, next) => {
    try {
        const todoId = req.params.id;
        await todossService.deleteById(todoId, req.body);
        res.status(200).send();
    } catch(e) {
        next(e);
    }
});

module.exports = todosRouter;