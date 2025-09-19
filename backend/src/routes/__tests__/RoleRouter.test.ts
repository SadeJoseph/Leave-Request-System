import request from 'supertest';
import express, { Router } from 'express';
import { RoleRouter } from '../RoleRouter';
import { RoleController } from '../../controllers/RoleController';
import { StatusCodes } from 'http-status-codes';


jest.mock("../../middleware/AdminOnly", () => ({
  adminOnly: (req, res, next ) => next(),
}));

const mockController = {
  delete: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  getAll: jest.fn((req, res) => res.status(StatusCodes.OK).json([])),
  getById: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
  update: jest.fn((req, res) => res.status(StatusCodes.OK).json(req.body))
} as unknown as RoleController;

const router = Router();
jest.spyOn(router, 'get');
jest.spyOn(router, 'post');
jest.spyOn(router, 'patch');
jest.spyOn(router, 'delete');

const app = express();
app.use(express.json());

const roleRouter = new RoleRouter(router, mockController);
app.use('/roles', roleRouter.getRouter());

const BASE_URL = '/roles';

describe('RoleRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /roles calls getAll', async () => {
    const res = await request(app).get(BASE_URL);
    expect(mockController.getAll).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual([]);
  });

  it('GET /roles/:id calls getById', async () => {
    const id = '5';
    const res = await request(app).get(`${BASE_URL}/${id}`);
    expect(mockController.getById).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id });
  });

  it('POST /roles calls create', async () => {
    const role = { name: 'staff' };
    const res = await request(app).post(BASE_URL).send(role);
    expect(mockController.create).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body).toEqual(role);
  });

  it('PATCH /roles calls update', async () => {
    const updatedRole = { id: 3, name: 'admin' };
    const res = await request(app).patch(BASE_URL).send(updatedRole);
    expect(mockController.update).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual(updatedRole);
  });

  it('DELETE /roles/:id calls delete', async () => {
    const id = '2';
    const res = await request(app).delete(`${BASE_URL}/${id}`);
    expect(mockController.delete).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id });
  });
});
