
import { LoginController } from "../LoginController";
import { User } from "../../entity/User";
import { Repository } from "typeorm";
import { ResponseHandler } from "../../helper/ResponseHandler";
import { PasswordHandler } from "../../helper/PasswordHandler";
import { mock } from "jest-mock-extended";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

jest.mock("../../helper/ResponseHandler");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked.jwt.token")
}));

describe("LoginController", () => {
  let controller: LoginController;
  let mockUserRepo: jest.Mocked<Repository<User>>;
  const mockRes = mock<Response>();

  const validUser: User = {
    id: 1,
    email: "test@example.com",
    password: "hashedPassword",
    salt: "randomSalt",
    firstname: "John",
    surname: "Doe",
    role: { id: 2, name: "employee" },
    department: { id: 1, name: "Engineering" },
    annualLeaveBalance: 25,
  } as User;

  beforeEach(() => {
    mockUserRepo = mock<Repository<User>>();
    controller = new LoginController();
    controller["userRepository"] = mockUserRepo;
    jest.clearAllMocks();
  });

  it("returns error if email is missing", async () => {
    const req = { body: { password: "pass" } } as Request;
    await controller.login(req, mockRes);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      mockRes,
      StatusCodes.BAD_REQUEST,
      "No email provided"
    );
  });

  it("returns error if password is missing", async () => {
    const req = { body: { email: "test@example.com" } } as Request;
    await controller.login(req, mockRes);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      mockRes,
      StatusCodes.BAD_REQUEST,
      "No password provided"
    );
  });

  it("returns error if user is not found", async () => {
    const req = { body: { email: "notfound@example.com", password: "pass" } } as Request;
    mockUserRepo.createQueryBuilder.mockReturnValue({
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    } as any);

    await controller.login(req, mockRes);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      mockRes,
      StatusCodes.BAD_REQUEST,
      "User not found"
    );
  });

  it("returns error if password is incorrect", async () => {
    const req = { body: { email: "test@example.com", password: "wrongpass" } } as Request;

    mockUserRepo.createQueryBuilder.mockReturnValue({
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(validUser),
    } as any);

    jest.spyOn(PasswordHandler, "verifyPassword").mockReturnValue(false);

    await controller.login(req, mockRes);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      mockRes,
      StatusCodes.BAD_REQUEST,
      "Password incorrect"
    );
  });

  it("returns JWT token on successful login", async () => {
    const req = { body: { email: "test@example.com", password: "correctpass" } } as Request;

    mockUserRepo.createQueryBuilder.mockReturnValue({
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(validUser),
    } as any);

    jest.spyOn(PasswordHandler, "verifyPassword").mockReturnValue(true);

    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { status } as unknown as Response;

    await controller.login(req, res);
    expect(status).toHaveBeenCalledWith(StatusCodes.ACCEPTED);
    expect(send).toHaveBeenCalledWith("mocked.jwt.token");
  });
});
