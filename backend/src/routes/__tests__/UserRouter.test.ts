import request from 'supertest';
import express, { Router } from 'express';
import { UserRouter } from '../UserRouter';
import { UserController } from '../../controllers/UserController';
import { StatusCodes } from 'http-status-codes';

jest.mock("../../middleware/AdminOnly", () => ({
  adminOnly: (req, res, next ) => next(),
}));

const mockController = {
  delete: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  getAll: jest.fn((req, res) => res.status(StatusCodes.OK).json([])),
  getByEmail: jest.fn((req, res) => res.status(StatusCodes.OK).json({ email: req.params.emailAddress })),
  getById: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
  update: jest.fn((req, res) => res.status(StatusCodes.OK).json(req.body)),
  resetBalance: jest.fn((req, res) => res.status(StatusCodes.OK).json({ message: "Balance reset" })),
  resetAllBalances: jest.fn((req, res) => res.status(StatusCodes.OK).json({ message: "All balances reset" })),
} as unknown as UserController;

const router = Router();
jest.spyOn(router, 'get');
jest.spyOn(router, 'post');
jest.spyOn(router, 'patch');
jest.spyOn(router, 'delete');

const app = express();
app.use(express.json());

const userRouter = new UserRouter(router, mockController);
app.use('/users', userRouter.getRouter());

const BASE_URL = '/users';

describe('UserRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users calls getAll', async () => {
    const res = await request(app).get(BASE_URL);
    expect(mockController.getAll).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual([]);
  });

  it('GET /users/email/:emailAddress calls getByEmail', async () => {
    const email = 'test@example.com';
    const res = await request(app).get(`${BASE_URL}/email/${email}`);
    expect(mockController.getByEmail).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ email });
  });

  it('GET /users/:id calls getById', async () => {
    const id = '42';
    const res = await request(app).get(`${BASE_URL}/${id}`);
    expect(mockController.getById).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id });
  });

  it('POST /users calls create', async () => {
    const newUser = { firstname: 'Jane', surname: 'Doe', email: 'jane@example.com' };
    const res = await request(app).post(BASE_URL).send(newUser);
    expect(mockController.create).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body).toEqual(newUser);
  });

  it('PATCH /users calls update', async () => {
    const updatedUser = { id: 1, firstname: 'Jane', email: 'updated@example.com' };
    const res = await request(app).patch(BASE_URL).send(updatedUser);
    expect(mockController.update).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual(updatedUser);
  });

  it('DELETE /users/:id calls delete', async () => {
    const id = '1';
    const res = await request(app).delete(`${BASE_URL}/${id}`);
    expect(mockController.delete).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id });
  });

  it('PATCH /users/:id/reset-balance calls resetBalance', async () => {
  const id = '1';
  const res = await request(app).patch(`${BASE_URL}/${id}/reset-balance`);
  expect(mockController.resetBalance).toHaveBeenCalled();
  expect(res.status).toBe(StatusCodes.OK);
  expect(res.body).toEqual({ message: "Balance reset" });
});

it('PATCH /users/reset-all-balances calls resetAllBalances', async () => {
  const res = await request(app).patch(`${BASE_URL}/reset-all-balances`);
  expect(mockController.resetAllBalances).toHaveBeenCalled();
  expect(res.status).toBe(StatusCodes.OK);
  expect(res.body).toEqual({ message: "All balances reset" });
});

});
