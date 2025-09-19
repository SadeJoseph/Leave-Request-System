import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { ResponseHandler } from "../helper/ResponseHandler";
import { UserManagement } from "../entity/UserManagement";
import { LeaveRequest } from "../entity/LeaveRequest";

export const adminOrAssignedManager = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;
  const leaveRequestId = req.params.id ? parseInt(req.params.id) : null;

  if (!user || !user.role?.name) {
    ResponseHandler.sendErrorResponse(res, 400, "Invalid user or request");
    return;
  }

  // Admin can always proceed
  if (user.role.name === "admin") {
    next();
    return;
  }

  // Not a manager
  if (user.role.name !== "manager") {
    ResponseHandler.sendErrorResponse(res, 403, "Forbidden - not admin or manager");
    return;
  }

  // If no ID param, let manager proceed (for GET /api/leave-requests)
  if (!leaveRequestId) {
    next();
    return;
  }

  try {
    const leaveRepo = AppDataSource.getRepository(LeaveRequest);
    const leaveRequest = await leaveRepo.findOne({
      where: { id: leaveRequestId },
      relations: ["user"],
    });

    if (!leaveRequest) {
      ResponseHandler.sendErrorResponse(res, 404, "Leave request not found");
      return;
    }

    const targetUserId = leaveRequest.user.id;

    const userManagementRepo = AppDataSource.getRepository(UserManagement);
    const assignment = await userManagementRepo.findOne({
      where: {
        manager: { id: user.id },
        user: { id: targetUserId },
      },
    });

    if (!assignment) {
      ResponseHandler.sendErrorResponse(res, 403, "Forbidden - not assigned manager");
      return;
    }

    next();
  } catch (error: any) {
    ResponseHandler.sendErrorResponse(res, 500, "Server error");
  }
};

