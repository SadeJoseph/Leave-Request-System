import { LeaveRequestController } from "../LeaveRequestController";
import { Repository } from "typeorm";
import { LeaveRequest } from "../../entity/LeaveRequest";
import { User } from "../../entity/User";
import { UserManagement } from "../../entity/UserManagement";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../../helper/ResponseHandler";
import { mock } from "jest-mock-extended";
import { IAuthenticatedRequest } from "../../types/IAuthenticatedRequest";
import { Response } from "express";

jest.mock("../../helper/ResponseHandler");

describe("LeaveRequestController", () => {
  let controller: LeaveRequestController;
  let mockLeaveRepo: jest.Mocked<Repository<LeaveRequest>>;
  let mockUserRepo: jest.Mocked<Repository<User>>;
  let mockUserManagementRepo: jest.Mocked<Repository<UserManagement>>;

  const mockUser = {
    id: 1,
    email: "test@example.com",
    role: { name: "employee" },
    annualLeaveBalance: 25.0,
  } as User;
  const mockManager = {
    id: 2,
    email: "manager@example.com",
    role: { name: "manager" },
  } as User;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as unknown as Response;
  };

  beforeEach(() => {
    mockLeaveRepo = mock<Repository<LeaveRequest>>();
    mockUserRepo = mock<Repository<User>>();
    mockUserManagementRepo = mock<Repository<UserManagement>>();

    controller = new LeaveRequestController();
    controller["leaveRepo"] = mockLeaveRepo;
    controller["userRepo"] = mockUserRepo;
    controller["userManagementRepo"] = mockUserManagementRepo;

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a leave request", async () => {
      const req = {
        body: {
          startDate: tomorrow.toISOString(),
          endDate: tomorrow.toISOString(),
          reason: "Test Reason",
          leaveType: "Annual Leave",
        },
        user: { id: mockUser.id },
      } as unknown as IAuthenticatedRequest;

      const res = mockResponse();

      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockLeaveRepo.findOne.mockResolvedValue(null);

      mockLeaveRepo.create.mockReturnValue({ id: 1 } as LeaveRequest);
      mockLeaveRepo.save.mockResolvedValue({ id: 1 } as LeaveRequest);

      await controller.create(req, res);

      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        { id: 1 },
        StatusCodes.CREATED
      );
    });
  });

  describe("getMine", () => {
    it("should return user leave requests", async () => {
      const req = { user: { id: mockUser.id } } as any;
      const res = mockResponse();

      mockLeaveRepo.find.mockResolvedValue([{ id: 1 }] as LeaveRequest[]);

      await controller.getMine(req, res);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [
        { id: 1 },
      ]);
    });
  });

  describe("approve", () => {
    it("should approve a request if authorised", async () => {
      const req = {
        params: { id: "1" },
        user: { id: mockManager.id, role: { name: "manager" } },
      } as any;

      const res = mockResponse();

      const leaveRequest = {
        id: 1,
        status: "Pending",
        user: { id: mockUser.id, annualLeaveBalance: 25.0 },
        startDate: tomorrow,
        endDate: tomorrow,
      } as LeaveRequest;

      mockLeaveRepo.findOne.mockResolvedValue(leaveRequest);
      mockUserManagementRepo.find.mockResolvedValue([
        { user: { id: mockUser.id } },
      ] as UserManagement[]);
      mockUserRepo.save.mockResolvedValue(mockUser);
      mockLeaveRepo.save.mockResolvedValue(leaveRequest);

      await controller.approve(req, res);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        leaveRequest
      );
    });
  });

  describe("reject", () => {
    it("should reject a request if authorised", async () => {
      const req = {
        params: { id: "1" },
        user: { id: mockManager.id, role: { name: "manager" } },
      } as any;

      const res = mockResponse();

      const leaveRequest = {
        id: 1,
        status: "Pending",
        user: { id: mockUser.id },
      } as LeaveRequest;

      mockLeaveRepo.findOne.mockResolvedValue(leaveRequest);
      mockUserManagementRepo.find.mockResolvedValue([
        { user: { id: mockUser.id } },
      ] as UserManagement[]);
      mockLeaveRepo.save.mockResolvedValue(leaveRequest);

      await controller.reject(req, res);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        leaveRequest
      );
    });
  });

  describe("cancel", () => {
    it("should cancel a request by admin or owner", async () => {
      const req = {
        params: { id: "1" },
        user: { id: mockUser.id, role: "admin" },
      } as any;

      const res = mockResponse();

      const leaveRequest = {
        id: 1,
        user: { id: mockUser.id },
      } as LeaveRequest;

      mockLeaveRepo.findOne.mockResolvedValue(leaveRequest);
      mockLeaveRepo.remove.mockResolvedValue(leaveRequest);

      await controller.cancel(req, res);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        res,
        "Leave request cancelled"
      );
    });
  });
});
