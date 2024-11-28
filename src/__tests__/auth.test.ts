import * as http from 'http';
import app from '../app';
import connectDatabase from '../startup/database';
import passportStartup from '../startup/passport';
import request from "supertest";

let server: http.Server;
let authToken: string | null;

beforeAll(async () => {
    try {
        await connectDatabase();
        await passportStartup(app);
        server = app.listen(3000, () => {
            console.log('Server successfully started at port: 3000');
        });
    } catch (error) {
        console.error('Error during test server setup:', error);
    }
});

afterAll(() => {
    server.close();
    authToken = null;
});

describe('Auth Routes', () => {
    describe('POST /api/public/register', () => {
        it('should respond with status 422 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/public/register')
                .send({
                    "role": 0
                    // Missing required fields
                });
            expect(response.status).toBe(422);
        });

        it('should respond with status 200 when registering as student', async () => {
            const response = await request(app)
                .post('/api/public/register')
                .send({
                    "role": 0,
                    "name": "Maneesh Test",
                    "email": "it21169908@my.sliit.lk",
                    "password": "password123",
                    "confirmPassword": "password123",
                    "studentId": "IT21169908",
                    "remember": true
                });
            expect(response.status).toBe(200);
        });

        it('should respond with status 409 for existing email', async () => {
            const response = await request(app)
                .post('/api/public/register')
                .send({
                    "role": 0,
                    "name": "Maneesh Test",
                    "email": "it21169908@my.sliit.lk",
                    "password": "password123",
                    "confirmPassword": "password123",
                    "studentId": "IT21169908",
                    "remember": true
                });
            expect(response.status).toBe(409);
        });

        it('should respond with status 200 when registering as faculty staff', async () => {
            const response = await request(app)
                .post('/api/public/register')
                .send({
                    "role": 2,
                    "name": "Maneesh Fs Test",
                    "email": "fstaff@my.sliit.lk",
                    "password": "password123",
                    "confirmPassword": "password123",
                    "facultyId": "FS21169918",
                    "remember": true
                });
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/public/login', () => {
        it('should respond with status 422 for incorrect email', async () => {
            const response = await request(app)
                .post('/api/public/login')
                .send({
                    "email": "incorrect_email",
                    "password": "password123",
                    "signedUpAs": "EMAIL",
                    "remember": true
                });
            expect(response.status).toBe(422);
        });

        it('should respond with status 500 when notfound email user', async () => {
            const response = await request(app)
                .post('/api/public/login')
                .send({
                    "email": "se21169908@my.sliit.lk",
                    "password": "password123",
                    "signedUpAs": "EMAIL",
                    "remember": true
                });
            expect(response.status).toBe(500);
        });

        it('should respond with status 500 for incorrect password', async () => {
            const response = await request(app)
                .post('/api/public/login')
                .send({
                    "email": "it21169908@my.sliit.lk",
                    "password": "incorrect_password",
                    "signedUpAs": "EMAIL",
                    "remember": true
                });
            expect(response.status).toBe(500);
        });

        it('should respond with status 200 when logging in', async () => {
            const response = await request(app)
                .post('/api/public/login')
                .send({
                    "email": "it21169908@my.sliit.lk",
                    "password": "password123",
                    "signedUpAs": "EMAIL",
                    "remember": true
                });
            authToken = response.body.data.token;
            expect(response.status).toBe(200);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should respond with status 403 when unauthenticated user token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer unauthenticated-user-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1`);
            expect(response.status).toBe(403);
        });

        it('should respond with status 200 when getting user profile', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
        });
    });

    describe('PUT /api/auth/me', () => {
        it('should respond with status 200 when updating user profile', async () => {
            const response = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    "name": "Maneesh Test Updated",
                    "email": "it21169908@my.sliit.lk",
                    "phone": "0766171525"
                });
            expect(response.status).toBe(200);
        });
    });

    describe('DELETE /api/auth/me', () => {
        it('should respond with status 200 when deactivating user account', async () => {
            const response = await request(app)
                .delete('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
        });
    });

});
