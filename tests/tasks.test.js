const request = require('supertest');

const mockTask = {
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

jest.mock('../src/models/Task', () => mockTask);

const app = require('../src/app');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/tasks', () => {
  it('returns an array (even when empty)', async () => {
    mockTask.find.mockResolvedValue([]);
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/tasks', () => {
  it('returns 400 when title is empty string', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'no title here' });
    expect(res.statusCode).toBe(400);
  });

  it('creates a task and returns 201', async () => {
    const created = { _id: 'abc123', title: 'My task', status: 'todo' };
    mockTask.create.mockResolvedValue(created);
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'My task' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('My task');
  });
});
