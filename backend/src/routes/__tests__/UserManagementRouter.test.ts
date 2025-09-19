import request from 'supertest';
import express, { Router } from 'express';
import { UserManagementRouter } from '../UserManagementRouter';
import { UserManagementController } from '../../controllers/UserManagementController';
import { StatusCodes } from 'http-status-codes';


jest.mock("../../middleware/AdminOnly", () => ({
  adminOnly: (req, res, next ) => next(),
}));

jest.mock("../../middleware/AdminOrManager", () => ({
  adminOrAssignedManager: (req: any, res: any, next: any) => next(),
})); 

const mockController = {
  create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
  delete: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  getByManager: jest.fn((req, res) => res.status(StatusCodes.OK).json([{ managerId: req.params.managerId }])),
  getByEmployee: jest.fn((req, res) => res.status(StatusCodes.OK).json({ userId: req.params.userId })),
} as unknown as UserManagementController;

const router = Router();
jest.spyOn(router, 'get');
jest.spyOn(router, 'post');
jest.spyOn(router, 'delete');

const app = express();
app.use(express.json());

const userManagementRouter = new UserManagementRouter(router, mockController);
app.use('/user-management', userManagementRouter.getRouter());

const BASE_URL = '/user-management';

describe('UserManagementRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /user-management calls create', async () => {
    const newLink = { userId: 15, managerId: 2, startDate: '2024-01-01' };

    const res = await request(app).post(BASE_URL).send(newLink);

    expect(mockController.create).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body).toEqual(newLink);
  });

  it('GET /user-management/manager/:managerId calls getByManager', async () => {
    const managerId = '2';
    const res = await request(app).get(`${BASE_URL}/manager/${managerId}`);

    expect(mockController.getByManager).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual([{ managerId }]);
  });

  it('GET /user-management/employee/:userId calls getByEmployee', async () => {
    const userId = '15';
    const res = await request(app).get(`${BASE_URL}/employee/${userId}`);

    expect(mockController.getByEmployee).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ userId });
  });

  it('DELETE /user-management/:id calls delete', async () => {
    const id = '10';
    const res = await request(app).delete(`${BASE_URL}/${id}`);

    expect(mockController.delete).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id });
  });
});
