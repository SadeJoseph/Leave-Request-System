import { UserManagementController } from '../UserManagementController';
import { UserManagement } from '../../entity/UserManagement';
import { User } from '../../entity/User';
import { Repository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../helper/ResponseHandler';
import { Request, Response } from 'express';

jest.mock('../../helper/ResponseHandler');

describe('UserManagementController', () => {
  const mockRequest = (params = {}, body = {}): Partial<Request> => ({ params, body });
  const mockResponse = (): Partial<Response> => ({
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  });

  let controller: UserManagementController;
  let mockUserRepo: Partial<Repository<User>>;
  let mockUserManagementRepo: Partial<Repository<UserManagement>>;

  const managerUser = { id: 1, role: { name: 'manager' } } as User;
  const staffUser = { id: 2 } as User;

  beforeEach(() => {
    mockUserRepo = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
    };

    mockUserManagementRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    controller = new UserManagementController();
    controller['repo'] = mockUserManagementRepo as Repository<UserManagement>;
    controller['userRepo'] = mockUserRepo as Repository<User>;
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should return error if user or manager not found', async () => {
      const req = mockRequest({}, { userId: 2, managerId: 1 });
      const res = mockResponse();
      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.BAD_REQUEST, expect.any(String));
    });

    it('should return error if manager is not a manager', async () => {
      const req = mockRequest({}, { userId: 2, managerId: 1 });
      const res = mockResponse();
      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue(staffUser);
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, role: { name: 'staff' } });
      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.BAD_REQUEST, expect.any(String));
    });

    it('should return error if user already has active manager', async () => {
      const req = mockRequest({}, { userId: 2, managerId: 1 });
      const res = mockResponse();
      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue(staffUser);
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(managerUser);
      (mockUserManagementRepo.findOne as jest.Mock).mockResolvedValue({ id: 99 });
      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.BAD_REQUEST, expect.any(String));
    });

    it('should create user-management record', async () => {
      const req = mockRequest({}, { userId: 2, managerId: 1, startDate: '2024-01-01' });
      const res = mockResponse();
      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue(staffUser);
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(managerUser);
      (mockUserManagementRepo.findOne as jest.Mock).mockResolvedValue(null);
      (mockUserManagementRepo.create as jest.Mock).mockReturnValue({ id: 1 });
      (mockUserManagementRepo.save as jest.Mock).mockResolvedValue({ id: 1 });

      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, { id: 1 }, StatusCodes.CREATED);
    });
  });

  describe('getByManager', () => {
    it('should return BAD_REQUEST for invalid managerId', async () => {
      const req = mockRequest({ managerId: 'abc' });
      const res = mockResponse();
      await controller.getByManager(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 400, expect.any(String));
    });

    it('should return user-management records for manager', async () => {
      const req = mockRequest({ managerId: '1' });
      const res = mockResponse();
      const records = [{ id: 1 }, { id: 2 }];
      (mockUserManagementRepo.find as jest.Mock).mockResolvedValue(records);
      await controller.getByManager(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, records);
    });
  });

  describe('getByEmployee', () => {
    it('should return BAD_REQUEST for invalid userId', async () => {
      const req = mockRequest({ userId: 'xyz' });
      const res = mockResponse();
      await controller.getByEmployee(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 400, expect.any(String));
    });

    it('should return NOT_FOUND if user has no manager', async () => {
      const req = mockRequest({ userId: '2' });
      const res = mockResponse();
      (mockUserManagementRepo.findOne as jest.Mock).mockResolvedValue(null);
      await controller.getByEmployee(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 404, expect.any(String));
    });

    it('should return user-management record for user', async () => {
      const req = mockRequest({ userId: '2' });
      const res = mockResponse();
      const record = { id: 1, user: staffUser, manager: managerUser };
      (mockUserManagementRepo.findOne as jest.Mock).mockResolvedValue(record);
      await controller.getByEmployee(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, record);
    });
  });

  describe('delete', () => {
    it('should return BAD_REQUEST for invalid ID', async () => {
      const req = mockRequest({ id: 'abc' });
      const res = mockResponse();
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 400, expect.any(String));
    });

    it('should return NOT_FOUND if delete affected = 0', async () => {
      const req = mockRequest({ id: '1' });
      const res = mockResponse();
      (mockUserManagementRepo.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 404, expect.any(String));
    });

    it('should delete user-management record if valid', async () => {
      const req = mockRequest({ id: '1' });
      const res = mockResponse();
      (mockUserManagementRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, "User-management link deleted", 200);
    });
  });
});
