import { adminOrAssignedManager } from "../AdminOrManager";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../data-source";
import { LeaveRequest } from "../../entity/LeaveRequest";
import { UserManagement } from "../../entity/UserManagement";
import { ResponseHandler } from "../../helper/ResponseHandler";


jest.mock("../../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock("../../helper/ResponseHandler");



describe("adminOrAssignedManager middleware", () => {
  const mockLeaveRepo = {
    findOne: jest.fn()
  };

  const mockUserManagementRepo = {
    findOne: jest.fn()
  };

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  } as unknown as Response;

  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity.name === "LeaveRequest") return mockLeaveRepo;
      if (entity.name === "UserManagement") return mockUserManagementRepo;
    });
  });

  it("should call next if user is admin", async () => {
    const req = {
      params: { id: "1" },
      user: { id: 1, role: { name: "admin" } }
    } as unknown as Request;

    await adminOrAssignedManager(req, mockRes, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user is not admin or manager", async () => {
    const req = {
      params: { id: "1" },
      user: { id: 1, role: { name: "employee" } }
    } as unknown as Request;

    await adminOrAssignedManager(req, mockRes, next);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 403, "Forbidden - not admin or manager");
  });

  it("should return 400 if invalid leave request ID", async () => {
    const req = {
      params: { id: "abc" },
      user: { id: 1, role: { name: "manager" } }
    } as unknown as Request;

    await adminOrAssignedManager(req, mockRes, next);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 400, "Invalid leave request ID");
  });

  it("should return 404 if leave request is not found", async () => {
    const req = {
      params: { id: "1" },
      user: { id: 2, role: { name: "manager" } }
    } as unknown as Request;

    mockLeaveRepo.findOne.mockResolvedValue(null);

    await adminOrAssignedManager(req, mockRes, next);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 404, "Leave request not found");
  });

  it("should return 403 if manager is not assigned to user", async () => {
    const req = {
      params: { id: "1" },
      user: { id: 5, role: { name: "manager" } }
    } as unknown as Request;

    mockLeaveRepo.findOne.mockResolvedValue({
      user: { id: 10 }
    });

    mockUserManagementRepo.findOne.mockResolvedValue(null);

    await adminOrAssignedManager(req, mockRes, next);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 403, "Forbidden - not assigned manager");
  });

  it("should call next if manager is assigned to the user", async () => {
    const req = {
      params: { id: "1" },
      user: { id: 5, role: { name: "manager" } }
    } as unknown as Request;

    mockLeaveRepo.findOne.mockResolvedValue({
      user: { id: 10 }
    });

    mockUserManagementRepo.findOne.mockResolvedValue({
      user: { id: 10 },
      manager: { id: 5 }
    });

    await adminOrAssignedManager(req, mockRes, next);
    expect(next).toHaveBeenCalled();
  });
});
