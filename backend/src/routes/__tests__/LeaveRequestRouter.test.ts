import request from 'supertest';
import express, { Router } from 'express';
import { LeaveRequestRouter } from '../LeaveRequestRouter';
import { LeaveRequestController } from '../../controllers/LeaveRequestController';
import { StatusCodes } from 'http-status-codes';

jest.mock("../../middleware/AdminOrManager", () => ({
  adminOrAssignedManager: (req: any, res: any, next: any) => next(),
}));

const mockController = {
  create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
  getMine: jest.fn((req, res) => res.status(StatusCodes.OK).json([{ id: 1 }])),
  getAllForReviewer: jest.fn((req, res) => res.status(StatusCodes.OK).json([{ id: 2 }])),
  approve: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id, status: 'Approved' })),
  reject: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id, status: 'Rejected' })),
  cancel: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id, status: 'Cancelled' }))
} as unknown as LeaveRequestController;

const router = Router();
jest.spyOn(router, 'get');
jest.spyOn(router, 'post');
jest.spyOn(router, 'patch');
jest.spyOn(router, 'delete');

const app = express();
app.use(express.json());

const leaveRouter = new LeaveRequestRouter(router, mockController);
app.use('/leave-requests', leaveRouter.getRouter());

const BASE_URL = '/leave-requests';

describe('LeaveRequestRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /leave-requests calls create', async () => {
    const requestData = { startDate: '2024-06-01', endDate: '2024-06-03' };
    const res = await request(app).post(BASE_URL).send(requestData);
    expect(mockController.create).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body).toEqual(requestData);
  });

  it('GET /leave-requests/mine calls getMine', async () => {
    const res = await request(app).get(`${BASE_URL}/mine`);
    expect(mockController.getMine).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  it('GET /leave-requests calls getAllForReviewer', async () => {
    const res = await request(app).get(BASE_URL);
    expect(mockController.getAllForReviewer).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual([{ id: 2 }]);
  });

  it('PATCH /leave-requests/:id/approve calls approve', async () => {
    const id = '5';
    const res = await request(app).patch(`${BASE_URL}/${id}/approve`);
    expect(mockController.approve).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id, status: 'Approved' });
  });

  it('PATCH /leave-requests/:id/reject calls reject', async () => {
    const id = '6';
    const res = await request(app).patch(`${BASE_URL}/${id}/reject`);
    expect(mockController.reject).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id, status: 'Rejected' });
  });

  it('DELETE /leave-requests/:id calls cancel', async () => {
    const id = '7';
    const res = await request(app).delete(`${BASE_URL}/${id}`);
    expect(mockController.cancel).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ id, status: 'Cancelled' });
  });
});
