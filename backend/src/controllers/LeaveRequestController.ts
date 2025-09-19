import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LeaveRequest } from "../entity/LeaveRequest";
import { User } from "../entity/User";
import { UserManagement } from "../entity/UserManagement";
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { IAuthenticatedRequest } from "../types/IAuthenticatedRequest";

export class LeaveRequestController {
  private leaveRepo = AppDataSource.getRepository(LeaveRequest);
  private userRepo = AppDataSource.getRepository(User);
  private userManagementRepo = AppDataSource.getRepository(UserManagement);

  public create = async (
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate, reason, leaveType } = req.body;
        const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    // Check date 
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid start or end date");
    }

    if (start < today || end < today) {
      throw new Error("Start and end dates must be today or in the future");
    }

    if (end < start) {
      throw new Error("End date cannot be before start date");
    }
      const user = await this.userRepo.findOneBy({ id: req.user.id });
      if (!user) throw new Error("User not found");

        const overlapping = await this.leaveRepo.findOne({
      where: {
        user: { id: req.user.id },
        startDate: LessThanOrEqual(end),
        endDate: MoreThanOrEqual(start),
        status: In(["Pending", "Approved"]),
      },
      relations: ["user"],
    });

      if (overlapping) {
        throw new Error("You already have a leave request that overlaps with these dates.");
      }

      const request = this.leaveRepo.create({
        user,
        startDate,
        endDate,
        reason,
        leaveType,
      });

      const saved = await this.leaveRepo.save(request);
      ResponseHandler.sendSuccessResponse(res, saved, StatusCodes.CREATED);
      return;
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
      return;
    }
  };

  public getMine = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    try {
      const requests = await this.leaveRepo.find({
        where: { user: { id: userId } },
        relations: ["user"],
      });

      ResponseHandler.sendSuccessResponse(res, requests);
      return;
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
      return;
    }
  };

public getAllForReviewer = async (req: Request, res: Response): Promise<void> => {
  const requester = (req as any).user;
  const reviewerId = requester.id;
  const role = requester.role.name;

  try {
    if (role === "admin") {
      const all = await this.leaveRepo.find({ relations: ["user"] });
      ResponseHandler.sendSuccessResponse(res, all);
      return;
    }

    // find users this manager manages
    const managed = await this.userManagementRepo.find({
      where: { manager: { id: reviewerId } },
      relations: ["user"],
    });

    const userIds = managed.map((r) => r.user.id);

    if (userIds.length === 0) {
      ResponseHandler.sendSuccessResponse(res, []); // no staff
      return;
    }

    // Use In()
    const requests = await this.leaveRepo.find({
      where: { user: { id: In(userIds) } },
      relations: ["user"],
    });

    ResponseHandler.sendSuccessResponse(res, requests);
  } catch (error: any) {
    ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
  }
};


  public approve = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const request = await this.leaveRepo.findOne({
        where: { id },
        relations: ["user"],
      });

      if (!request) throw new Error("Leave request not found");
      if (request.status !== "Pending") throw new Error("Only pending requests can be approved");

      const requester = (req as any).user;
      if (!(await this.isAuthorisedReviewer(requester, request.user.id))) {
        throw new Error("Not authorised to approve this request");
      }

      request.status = "Approved";
      const currentBalance = parseFloat(request.user.annualLeaveBalance.toString());
      request.user.annualLeaveBalance = parseFloat((currentBalance - this.calculateDays(request)).toFixed(2));
      await this.userRepo.save(request.user);
      await this.leaveRepo.save(request);

      ResponseHandler.sendSuccessResponse(res, request);
      return;
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, error.message);
      return;
    }
  };

  public reject = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const request = await this.leaveRepo.findOne({
        where: { id },
        relations: ["user"],
      });

      if (!request) throw new Error("Leave request not found");
      if (request.status !== "Pending") throw new Error("Only pending requests can be rejected");

      const requester = (req as any).user;
      if (!(await this.isAuthorisedReviewer(requester, request.user.id))) {
        throw new Error("Not authorised to reject this request");
      }

      request.status = "Rejected";
      await this.leaveRepo.save(request);

      ResponseHandler.sendSuccessResponse(res, request);
      return;
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, error.message);
      return;
    }
  };

  public cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const request = await this.leaveRepo.findOne({
        where: { id },
        relations: ["user"],
      });

      if (!request) throw new Error("Request not found");

      const requester = (req as any).user;
      if (requester.role !== "admin" && requester.id !== request.user.id) {
        throw new Error("You are not allowed to cancel this request");
      }

      await this.leaveRepo.remove(request);
      ResponseHandler.sendSuccessResponse(res, "Leave request cancelled");
      return;
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, error.message);
      return;
    }
  };

  private isAuthorisedReviewer = async (
    requester: any,
    targetUserId: number
  ): Promise<boolean> => {
    if (requester.role?.name === "admin") return true;

    const records = await this.userManagementRepo.find({
      where: { manager: { id: requester.id } },
      relations: ["user"],
    });

    return records.some((r) => r.user.id === targetUserId);
  };

  private calculateDays = (req: LeaveRequest): number => {
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
    return Math.max(days, 0);
  };
}
