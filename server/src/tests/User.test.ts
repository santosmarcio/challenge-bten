import app from '@app';
import createConnection from '@database';
import request from 'supertest';
import { Connection } from 'typeorm';
import User from '../models/User';

const user = {
  homeTeam: 'Teste',
  email: 'e@e.com',
  password: '123456',
  name: 'Márcio',
  height: 85,
  age: new Date(),
} as User;

describe('Users', () => {
  let userCreated: User;
  let connection: Connection;
  let token: String;

  beforeAll(async () => {
    connection = await createConnection();
  });
  afterAll(async () => await connection.close());

  it('Should be able to create a new user', async () => {
    const response = await request(app).post('/user').send(user);
    expect(response.status).toBe(201);
    userCreated = response.body;
    token = response.body.token;
    expect(userCreated.name).toBe(user.name);
    expect(userCreated.email).toBe(user.email);
    expect(userCreated.homeTeam).toBe(user.homeTeam);
    expect(userCreated.height).toBe(user.height);
  });

  it('Should be able to get a user by ID', async () => {
    const response = await request(app).get(`/user/${userCreated.id}`).set('authorization', `Barear ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(userCreated.name);
    expect(userCreated.email).toBe(user.email);
    expect(response.body.homeTeam).toBe(userCreated.homeTeam);
    expect(response.body.height).toBe(userCreated.height);
  });

  it('Should be able to get all users', async () => {
    const response = await request(app).get('/user').set('authorization', `Barear ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(true).toBe(
      response.body.data.some((u: User) => u.name === user.name),
    );
  });

  it('Should be able to update a user', async () => {
    const updateUser = { name: 'Márcio Corrêa' };
    const response = await request(app).put(`/user/${userCreated.id}`).send(updateUser).set('authorization', `Barear ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updateUser.name);
    expect(userCreated.email).toBe(user.email);
    expect(response.body.homeTeam).toBe(userCreated.homeTeam);
    expect(response.body.height).toBe(userCreated.height);
  });

  it('Should be able to remove a user', async () => {
    const response = await request(app).delete(`/user/${userCreated.id}`).set('authorization', `Barear ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.affected).toBe(1);
  });
});