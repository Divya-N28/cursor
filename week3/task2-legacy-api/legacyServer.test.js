const request = require('supertest');
const server = require('./legacyServer');

describe('Pure Node.js legacyServer POST /legacy-form', function() {
  afterAll(function(done) {
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it('should return errors for empty name and email', async function() {
    const res = await request(server)
      .post('/legacy-form')
      .send({ name: '', email: '', age: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors.name).toBe('Name is required');
    expect(res.body.errors.email).toBe('Email is required');
  });

  it('should return error for invalid email', async function() {
    const res = await request(server)
      .post('/legacy-form')
      .send({ name: 'John', email: 'invalid', age: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBe('Email is invalid');
  });

  it('should return error for non-numeric age', async function() {
    const res = await request(server)
      .post('/legacy-form')
      .send({ name: 'John', email: 'john@example.com', age: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.errors.age).toBe('Age must be a number');
  });

  it('should succeed for valid input', async function() {
    const res = await request(server)
      .post('/legacy-form')
      .send({ name: 'Jane', email: 'jane@example.com', age: '25' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Form submitted successfully!');
    expect(res.body.data).toEqual({ name: 'Jane', email: 'jane@example.com', age: '25' });
  });

  it('should succeed for valid input with empty age', async function() {
    const res = await request(server)
      .post('/legacy-form')
      .send({ name: 'Jane', email: 'jane@example.com', age: '' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Form submitted successfully!');
    expect(res.body.data).toEqual({ name: 'Jane', email: 'jane@example.com', age: '' });
  });

  it('should return 404 for other endpoints', async function() {
    const res = await request(server)
      .post('/not-exist')
      .send({});
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
}); 