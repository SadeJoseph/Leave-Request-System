import { RoleController } from "../RoleController";
import { Role } from "../../entity/Role";
import { Repository } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../../helper/ResponseHandler";
import { Request, Response } from "express";
import * as classValidator from "class-validator";

jest.mock("../../helper/ResponseHandler");
jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn(),
}));

describe("RoleController", () => {
  const VALID_ROLE = (): Role => {
    const role = new Role();
    role.id = 1;
    role.name = "manager";
    return role;
  };

  const mockRequest = (params = {}, body = {}): Partial<Request> => ({
    params,
    body,
  });
  const mockResponse = (): Partial<Response> => ({send: jest.fn(),
    
  });

  let controller: RoleController;
  let mockRepo: Partial<Repository<Role>>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    controller = new RoleController();
    controller["roleRepository"] = mockRepo as Repository<Role>;
  });

  afterEach(() => jest.clearAllMocks());

  describe("getAll", () => {
    it("returns NO_CONTENT if no roles exist", async () => {
      const req = mockRequest();
      const res = mockResponse();
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      await controller.getAll(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        StatusCodes.NO_CONTENT
      );
    });

    it("returns all roles", async () => {
      const role = VALID_ROLE();
      const req = mockRequest();
      const res = mockResponse();
      (mockRepo.find as jest.Mock).mockResolvedValue([role]);
      await controller.getAll(req as Request, res as Response);
      expect(res.send).toHaveBeenCalledWith([role]);
    });
  });

  describe("getById", () => {
    it("returns BAD_REQUEST for invalid id", async () => {
      const req = mockRequest({ id: "abc" });
      const res = mockResponse();
      await controller.getById(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        400,
        expect.any(String)
      );
    });

    it("returns NOT_FOUND for missing role", async () => {
      const req = mockRequest({ id: "1" });
      const res = mockResponse();
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
      await controller.getById(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        404,
        expect.any(String)
      );
    });

    it("returns role if found", async () => {
      const role = VALID_ROLE();
      const req = mockRequest({ id: "1" });
      const res = mockResponse();
      (mockRepo.findOne as jest.Mock).mockResolvedValue(role);
      await controller.getById(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        role
      );
    });
  });

  describe("create", () => {
    it("returns BAD_REQUEST if validation fails", async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();
      jest.spyOn(classValidator, "validate").mockResolvedValue([
        {
          property: "name",
          constraints: {
            isNotEmpty: "Name is blank",
          },
        } as classValidator.ValidationError,
      ]);
      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        400,
        expect.stringContaining("Name is blank")
      );
    });

    it("creates role if valid", async () => {
      const role = VALID_ROLE();
      const req = mockRequest({}, { name: "manager" });
      const res = mockResponse();
      jest.spyOn(classValidator, "validate").mockResolvedValue([]);
      (mockRepo.save as jest.Mock).mockResolvedValue(role);
      await controller.create(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        role,
        201
      );
    });
  });

  describe("delete", () => {
    it("returns error if no ID provided", async () => {
      const req = mockRequest();
      const res = mockResponse();
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        404,
        expect.any(String)
      );
    });

    it("returns NOT_FOUND if delete affected = 0", async () => {
      const req = mockRequest({ id: "99" });
      const res = mockResponse();
      (mockRepo.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        404,
        expect.any(String)
      );
    });

    it("deletes role if valid", async () => {
      const req = mockRequest({ id: "1" });
      const res = mockResponse();
      (mockRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await controller.delete(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        "Role deleted"
      );
    });
  });

  describe("update", () => {
    it("returns BAD_REQUEST if role not found", async () => {
      const req = mockRequest({}, { id: 99 });
      const res = mockResponse();
      (mockRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await controller.update(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        400,
        expect.any(String)
      );
    });

    it("returns BAD_REQUEST if name is blank", async () => {
      const role = VALID_ROLE();
      const req = mockRequest({}, { id: 1, name: "" });
      const res = mockResponse();
      (mockRepo.findOneBy as jest.Mock).mockResolvedValue(role);
      jest.spyOn(classValidator, "validate").mockResolvedValue([
        {
          property: "name",
          constraints: {
            isNotEmpty: "Name is blank",
          },
        } as classValidator.ValidationError,
      ]);
      await controller.update(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        res,
        400,
        expect.stringContaining("Name is blank")
      );
    });

    it("updates role if valid", async () => {
      const role = VALID_ROLE();
      const req = mockRequest({}, { id: 1, name: "admin" });
      const res = mockResponse();
      (mockRepo.findOneBy as jest.Mock).mockResolvedValue(role);
      jest.spyOn(classValidator, "validate").mockResolvedValue([]);
      (mockRepo.save as jest.Mock).mockResolvedValue(role);
      await controller.update(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        role
      );
    });
  });
});
