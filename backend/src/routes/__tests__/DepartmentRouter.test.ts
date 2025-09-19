import request from 'supertest';
import express, { Router } from 'express';
import { DepartmentRouter } from '../DepartmentRouter';
import { DepartmentController } from '../../controllers/DepartmentController';
import { StatusCodes } from 'http-status-codes';

jest.mock("../../middleware/AdminOnly", () => ({
  adminOnly: (req, res, next ) => next(),
}));

const mockController = {
  getAll: jest.fn((req, res) => res.status(StatusCodes.OK).json([])),
  getById: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
  delete: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
} as unknown as DepartmentController;


const router = Router();
jest.spyOn(router, 'get');
jest.spyOn(router, 'post');
jest.spyOn(router, 'delete');

const app = express();
app.use(express.json());

const departmentRouter = new DepartmentRouter(router, mockController);
app.use('/departments', departmentRouter.getRouter());

const BASE_URL = '/departments';

describe('DepartmentRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /departments calls getAll', async () => {
    const res = await request(app).get(BASE_URL);
    expect(mockController.getAll).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual([]);
  });

  it('GET /departments/:id calls getById', async () => {
    const id = '1';
    const res = await request(app).get(`${BASE_URL}/${id}`);
    expect(mockController.getById).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id });
  });

  it('POST /departments calls create', async () => {
    const newDepartment = { name: 'HR' };
    const res = await request(app).post(BASE_URL).send(newDepartment);
    expect(mockController.create).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body).toEqual(newDepartment);
  });

  it('DELETE /departments/:id calls delete', async () => {
    const id = '2';
    const res = await request(app).delete(`${BASE_URL}/${id}`);
    expect(mockController.delete).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id });
  });
});
