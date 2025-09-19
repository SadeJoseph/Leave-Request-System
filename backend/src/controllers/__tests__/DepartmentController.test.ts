import { DepartmentController } from '../DepartmentController';
import { Department } from '../../entity/Department';
import { Repository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../helper/ResponseHandler';
import { Request, Response } from 'express';
import * as classValidator from 'class-validator';

jest.mock('../../helper/ResponseHandler');
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('DepartmentController', () => {
  const VALID_DEPARTMENT = (): Department => {
    const dept = new Department();
    dept.id = 1;
    dept.name = "IT";
    return dept;
  };

  const mockRequest = (params = {}, body = {}): Partial<Request> => ({ params, body });
  const mockResponse = (): Partial<Response> => ({
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  });

  let controller: DepartmentController;
  let mockRepo: Partial<Repository<Department>>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    controller = new DepartmentController();
    controller['departmentRepository'] = mockRepo as Repository<Department>;
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('returns NO_CONTENT and empty array if no departments exist', async () => {
      const req = mockRequest();
      const res = mockResponse();
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      await controller.getAll(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [], StatusCodes.NO_CONTENT);
    });

    it('returns all departments', async () => {
      const dept = VALID_DEPARTMENT();
      const req = mockRequest();
      const res = mockResponse();
      (mockRepo.find as jest.Mock).mockResolvedValue([dept]);
      await controller.getAll(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [dept]);
    });
  });

  describe('getById', () => {
    it('returns BAD_REQUEST for invalid id', async () => {
      const req = mockRequest({ id: 'abc' });
      const res = mockResponse();
      await controller.getById(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 400, expect.any(String));
    });

    it('returns NOT_FOUND for missing department', async () => {
      const req = mockRequest({ id: '1' });
      const res = mockResponse();
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
      await controller.getById(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 404, expect.any(String));
    });

    it('returns department if found', async () => {
      const dept = VALID_DEPARTMENT();
      const req = mockRequest({ id: '1' });
      const res = mockResponse();
      (mockRepo.findOne as jest.Mock).mockResolvedValue(dept);
      await controller.getById(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, dept);
    });
  });

  describe('create', () => {
    it('returns BAD_REQUEST if validation fails', async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();
      jest.spyOn(classValidator, 'validate').mockResolvedValue([
        {
          property: 'name',
          constraints: {
            isNotEmpty: 'Department name is required'
          },
        } as classValidator.ValidationError,
      ]);
      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 400, expect.stringContaining("Department name is required"));
    });

    it('creates department if valid', async () => {
      const dept = VALID_DEPARTMENT();
      const req = mockRequest({}, { name: "IT" });
      const res = mockResponse();
      jest.spyOn(classValidator, 'validate').mockResolvedValue([]);
      (mockRepo.save as jest.Mock).mockResolvedValue(dept);
      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, dept, 201);
    });
  });

  describe('delete', () => {
    it('returns NOT_FOUND if delete affected = 0', async () => {
      const req = mockRequest({ id: '99' });
      const res = mockResponse();
      (mockRepo.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 404, "Department not found");
    });

    it('deletes department if valid', async () => {
      const req = mockRequest({ id: '1' });
      const res = mockResponse();
      (mockRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, "Department deleted", 200);
    });
  });
});
