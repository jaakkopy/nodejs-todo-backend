const supertest = require('supertest');
const app = require('../src/app');
const testUserData = require('./testUser');
const db = require('../src/db/db');
const api = supertest(app);

beforeEach(async () => {
    const createTodosTEMP = 'CREATE TEMPORARY TABLE IF NOT EXISTS todos (LIKE todos INCLUDING ALL);';
    const createUsersTEMP = 'CREATE TEMPORARY TABLE IF NOT EXISTS users (LIKE users INCLUDING ALL);';
    await db.query(createUsersTEMP);
    await db.query(createTodosTEMP);
});

test('Should be able to sign up', async () => {
    await api.post('/api/v1/signup').send(testUserData).expect(201);
});

test('Should be able to sign in', async () => {
    await api.post('/api/v1/signup').send(testUserData);
    await api.post('/api/v1/signin').send(testUserData).expect(200).expect('Content-Type', /application\/json/);
});

test('Should not be able to sign in with wrong password', async () => {
    await api.post('/api/v1/signup').send(testUserData);
    let dummy = {...testUserData};
    dummy.password = "wrong password";
    await api.post('/api/v1/signin').send(dummy).expect(403);
});

test('Should not be able to sign in with email that is not in the database', async () => {
    await api.post('/api/v1/signup').send(testUserData);
    let dummy = {...testUserData};
    dummy.email = "wrong@gmail.com";
    await api.post('/api/v1/signin').send(dummy).expect(404); // 404 no such user
});

test('Should be able to change password after sign in', async () => {
    await api.post('/api/v1/signup').send(testUserData);
    const res = await api.post('/api/v1/signin').send(testUserData);
    const token = res.body.token; 
    let user = {...testUserData};
    user.password = "changed";

    await api.put('/api/v1/changePassword')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .expect(200);
    
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [user.email]);
    expect(rows[0].password).toBe("changed");
});

test('Should not be able to change the password of another user', async () => {
    await api.post('/api/v1/signup').send(testUserData);
    const res = await api.post('/api/v1/signin').send(testUserData);
    const token = res.body.token;
    let user = {...testUserData};
    user.password = "changed";
    user.email = "wrong@gmail.com";

    await api.put('/api/v1/changePassword')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .expect(403);
});

test('Should not be able to change password without JWT', async () => {
    await api.post('/api/v1/signup').send(testUserData);
    await api.post('/api/v1/signin').send(testUserData);
    let user = {...testUserData};
    user.password = "changed";

    await api.put('/api/v1/changePassword')
        .send(user)
        .expect(401);
});

test('Should receive 403 if the JWT is not valid', async () => {
    await api.post('/api/v1/signup').send(testUserData);
    await api.post('/api/v1/signin').send(testUserData);
    let user = {...testUserData};
    user.password = "changed";

    await api.put('/api/v1/changePassword')
        .set('Authorization', 'Bearer anInvalidToken')
        .send(user)
        .expect(403);
});

afterEach(async () => {
    await db.query('TRUNCATE TABLE users CASCADE');
    await db.query('TRUNCATE TABLE todos');
});