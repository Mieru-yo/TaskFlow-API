const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Integration: task creation and retrieval', () => {
  it('creates a task then retrieves it by id', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Integration task', description: 'Testing end to end', status: 'in-progress' });

    expect(createRes.statusCode).toBe(201);
    const taskId = createRes.body._id;
    expect(taskId).toBeDefined();

    const getRes = await request(app).get(`/api/tasks/${taskId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.title).toBe('Integration task');
    expect(getRes.body.status).toBe('in-progress');
  });

  it('returns 404 for a non-existent task id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/tasks/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  it('updates a task status', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task to update' });
    const taskId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'done' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('done');
  });

  it('deletes a task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task to delete' });
    const taskId = createRes.body._id;

    const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
    expect(deleteRes.statusCode).toBe(204);

    const getRes = await request(app).get(`/api/tasks/${taskId}`);
    expect(getRes.statusCode).toBe(404);
  });

  it('returns 404 when updating a non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/tasks/${fakeId}`)
      .send({ status: 'done' });
    expect(res.statusCode).toBe(404);
  });

  it('returns 404 when deleting a non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/tasks/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  it('returns all tasks from GET /api/tasks', async () => {
    await request(app).post('/api/tasks').send({ title: 'Task A' });
    await request(app).post('/api/tasks').send({ title: 'Task B' });
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});
