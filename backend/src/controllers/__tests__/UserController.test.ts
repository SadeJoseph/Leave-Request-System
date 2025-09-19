
import { UserController } from "../UserController";
import { User } from "../../entity/User";
import { Repository } from "typeorm";
import { mock } from "jest-mock-extended";
import { ResponseHandler } from "../../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import * as classValidator from "class-validator";


jest.mock("../../helper/ResponseHandler");
jest.spyOn(classValidator, "validate").mockResolvedValue([])

describe("UserController", () => {
  let controller: UserController;
  let userRepo: jest.Mocked<Repository<User>>;
  let mockRes: jest.Mocked<Response>;
  const mockUser: User = {
    id: 1,
    firstname: "Sade",
    surname: "Joseph",
    email: "sade@example.com",
    password: "hashed",
    salt: "salt",
    annualLeaveBalance: 25,
    role: { id: 2, name: "admin" },
    department: { id: 1, name: "Engineering" },
  } as User;

  beforeEach(() => {
    userRepo = mock<Repository<User>>();
    controller = new UserController();
    controller["userRepository"] = userRepo;
    mockRes = mock<Response>();
    mockRes.status.mockReturnThis();
    mockRes.send.mockReturnThis();
    jest.clearAllMocks();
  });

  it("should return users for getAll", async () => {
    userRepo.find.mockResolvedValue([mockUser]);
    await controller.getAll({} as Request, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, [mockUser]);
  });

  it("should get user by email", async () => {
    const req = { params: { emailAddress: "sade@example.com" } } as unknown as Request;
    userRepo.findOne.mockResolvedValue(mockUser);
    await controller.getByEmail(req, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, mockUser);
  });

  it("should get user by ID", async () => {
    const req = { params: { id: "1" } } as unknown as Request;
    userRepo.findOne.mockResolvedValue(mockUser);
    await controller.getById(req, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, mockUser);
  });

  it("should create a user", async () => {
    const req = {
      body: {
        firstname: "Sade",
        surname: "Joseph",
        email: "sade@example.com",
        password: "Password123!",
        roleId: mockUser.role,
        departmentId: mockUser.department,
      },
    } as Request;

    userRepo.save.mockResolvedValue(mockUser);
    await controller.create(req, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, mockUser, StatusCodes.CREATED);
  });

  it("should update user details", async () => {
    const req = {
      body: {
        id: 1,
        firstname: "Updated",
        surname: "Joseph",
        email: "updated@example.com",
        roleId: mockUser.role,
        departmentId: mockUser.department,
        annualLeaveBalance: 30,
      },
    } as Request;
    userRepo.findOneBy.mockResolvedValue(mockUser);
    userRepo.save.mockResolvedValue(mockUser);
    await controller.update(req, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, mockUser, StatusCodes.OK);
  });

  it("should delete a user", async () => {
    const req = { params: { id: "1" } } as unknown as Request;
    userRepo.delete.mockResolvedValue({ affected: 1 } as any);
    await controller.delete(req, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, "User deleted", StatusCodes.OK);
  });

  it("should reset single user balance", async () => {
    const req = { params: { id: "1" } } as unknown as Request;
    userRepo.findOneBy.mockResolvedValue(mockUser);
    userRepo.save.mockResolvedValue(mockUser);
    await controller.resetBalance(req, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, mockUser, StatusCodes.OK);
  });

});
