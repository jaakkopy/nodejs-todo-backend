const supertest = require('supertest');
const app = require('../src/app');
const testUserData = require('./testUser');
const db = require('../src/db/db');
const api = supertest(app);

let loggedInUser;
let newTodo = {
    name: "new todo",
    description: "a thing to do",
    userid: null,
    status: "NotStarted"
};

// Note: creating a temporary table with the same name as the original table causes the temporary table to take precedence
// The original table will remain untouched.
beforeEach(async () => {
    const createTodosTEMP = 'CREATE TEMPORARY TABLE IF NOT EXISTS todos (LIKE todos INCLUDING ALL);';
    const createUsersTEMP = 'CREATE TEMPORARY TABLE IF NOT EXISTS users (LIKE users INCLUDING ALL);';
    await db.query(createUsersTEMP);
    await db.query(createTodosTEMP);
    await api.post('/api/v1/signup').send(testUserData);
    const res = await api.post('/api/v1/signin').send(testUserData);
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [testUserData.email]);
    loggedInUser = rows[0];
    loggedInUser.token = res.body.token;
});

describe('Without authorization:', () => {
    test('Should not be able to create a new todo', async () => {
        newTodo.userid = loggedInUser.id;

        await api.post('/api/v1/todos')
            .send(newTodo)
            .expect(401);
    });

    test('Should not be able to get todos', async () => {
        newTodo.userid = loggedInUser.id;

        await api.post('/api/v1/todos')
            .send(newTodo)
            .expect(401);
    });

    test('Should not be able to update a todo', async () => {
        newTodo.userid = loggedInUser.id;

        let addedTodo = await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)

        addedTodo.name = "changedSomething";

        await api.put(`/api/v1/todos/${addedTodo.id}`)
            .send(newTodo)
            .expect(401);
    });


    test('Should not be able to delete a todo', async () => {
        newTodo.userid = loggedInUser.id;

        let addedTodo = await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)

        addedTodo.name = "changedSomething";

        await api.delete(`/api/v1/todos/${addedTodo.id}`)
            .send(newTodo)
            .expect(401);
    });


    test('Should not be able to get todos with status of NotStarted', async () => {
        newTodo.userid = loggedInUser.id;

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo);

        await api.get('/api/v1/todos?status=NotStarted')
            .expect(401);
    });

    test('Should not be able to get todos with status of OnGoing', async () => {
        newTodo.userid = loggedInUser.id;

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo);

        await api.get('/api/v1/todos?status=OnGoing')
            .expect(401);
    });

    test('Should not be able to get todos with status of NotStarted', async () => {
        newTodo.userid = loggedInUser.id;

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo);

        await api.get('/api/v1/todos?status=NotStarted')
            .expect(401);
    });

});


describe('With authorization:', () => {
    test('Should be able to create a new todo', async () => {
        newTodo.userid = loggedInUser.id;

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)
            .expect(201);
    });


    test('Should be able to get all todos of the user', async () => {
        newTodo.userid = loggedInUser.id;
        
        let todoCopy = {...newTodo};
        todoCopy.status = 'NotStarted';

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(todoCopy);

        const res = await api.get('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        const {name, description, userid, status} = res.body[0];
        expect({name, description, userid, status}).toEqual(todoCopy);
    });

    test('Should be able to get todos with status of NotStarted', async () => {
        newTodo.userid = loggedInUser.id;

        let todoCopy = {...newTodo};
        todoCopy.status = 'NotStarted';

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(todoCopy);

        const res = await api.get('/api/v1/todos?status=NotStarted')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200);

        const {name, description, userid, status} = res.body[0];
        expect({name, description, userid, status}).toEqual(todoCopy);
    });

    test('Should be able to get todos with status of OnGoing', async () => {
        newTodo.userid = loggedInUser.id;

        let todoCopy = {...newTodo};
        todoCopy.status = 'OnGoing';

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(todoCopy);

        const res = await api.get('/api/v1/todos?status=OnGoing')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200);

        const {name, description, userid, status} = res.body[0];
        expect({name, description, userid, status}).toEqual(todoCopy);
    });

    test('Should be able to get todos with status of Completed', async () => {
        newTodo.userid = loggedInUser.id;

        let todoCopy = {...newTodo};
        todoCopy.status = 'Completed';

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(todoCopy);

        const res = await api.get('/api/v1/todos?status=Completed')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200);

        const {name, description, userid, status} = res.body[0];
        expect({name, description, userid, status}).toEqual(todoCopy);
    });


    test('Should be able to update a todo', async () => {
        newTodo.userid = loggedInUser.id;

        const addedTodoRes = await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)

        let addedTodo = addedTodoRes.body;
        addedTodo.name = "changedSomething";

        await api.put(`/api/v1/todos/${addedTodo.id}`)
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(addedTodo)
            .expect(200);
    });

    test('Should be able to delete a todo', async () => {
        newTodo.userid = loggedInUser.id;

        const addedTodoRes = await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)

        const addedTodo = addedTodoRes.body;

        await api.delete(`/api/v1/todos/${addedTodo.id}`)
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200);
    });

    test('Filtering by status should not return any todos with other statuses', async () => {
        let todoBase = {
            name: "new todo",
            description: "a thing to do",
            userid: loggedInUser.id,
            status: null 
        };

        todoBase.status = 'NotStarted';
        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(todoBase);

        todoBase.status = 'OnGoing';
        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(todoBase);

        todoBase.status = 'Completed';
        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(todoBase);

        let res = await api.get('/api/v1/todos?status=NotStarted')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200);
        expect(res.body.length).toBe(1);

        res = await api.get('/api/v1/todos?status=OnGoing')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200);
        expect(res.body.length).toBe(1);

        res = await api.get('/api/v1/todos?status=Completed')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(200);
        expect(res.body.length).toBe(1);
        
    });
});


describe('With authorization but with the wrong user id:', () => {
    test('Should not be able to create a todo', async () => {
        newTodo.userid = loggedInUser.id + 1; // set wrong id

        await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)
            .expect(403);
    });

    test('Should not be able to update a todo', async () => {
        newTodo.userid = loggedInUser.id;

        const res = await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)
        
        const added = res.body; 

        let suspiciousTodo = {...added};
        suspiciousTodo.userid = added.userid + 1; // wrong id

        await api.put(`/api/v1/todos/${suspiciousTodo.id}`)
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(suspiciousTodo)
            .expect(403)
    });

    test('Should not be able to delete a todo', async () => {
        newTodo.userid = loggedInUser.id;

        const res = await api.post('/api/v1/todos')
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .send(newTodo)
        
        const added = res.body; 
        let suspiciousTodo = {...added};
        suspiciousTodo.id = added.id + 1; // wrong id

        await api.delete(`/api/v1/todos/${suspiciousTodo.id}`)
            .set('Authorization', `Bearer ${loggedInUser.token}`)
            .expect(403)
    });

});


afterEach(async () => {
    await db.query('TRUNCATE TABLE users CASCADE');
    await db.query('TRUNCATE TABLE todos');
});