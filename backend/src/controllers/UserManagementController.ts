import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { UserManagement } from "../entity/UserManagement";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../helper/ResponseHandler";

export class UserManagementController {
  private repo: Repository<UserManagement>;
  private userRepo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserManagement);
    this.userRepo = AppDataSource.getRepository(User);
  }

  public create = async (req: Request, res: Response) => {
    try {
      const { userId, managerId, startDate, endDate } = req.body;

      const user = await this.userRepo.findOneBy({ id: userId });
      const manager = await this.userRepo.findOne({
        where: { id: managerId },
        relations: ["role"],
      });

      if (!user || !manager) throw new Error("Invalid user or manager ID");

      // only a user with role.id of 1 (manager) can be a manager
      if (!manager.role || manager.role.name.toLowerCase() !== "manager") {
        throw new Error("Assigned manager must have the 'Manager' role");
      }

      // Check for existing active assignment
      const existing = await this.repo.findOne({
        where: {
          user: { id: userId },
          endDate: null,
        },
        relations: ["user"],
      });

      if (existing) {
        throw new Error(`User ID ${userId} already has an active manager.`);
      }

      const cleanEndDate = endDate ?? null;

      const record = this.repo.create({
        user,
        manager,
        startDate,
        endDate: cleanEndDate,
      });
      const saved = await this.repo.save(record);

      ResponseHandler.sendSuccessResponse(res, saved, StatusCodes.CREATED);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        error.message
      );
    }
  };

  public getByManager = async (req: Request, res: Response) => {
    const managerId = parseInt(req.params.managerId);
    if (isNaN(managerId)) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid manager ID"
      );
      return;
    }

    try {
      const records = await this.repo.find({
        where: { manager: { id: managerId } },
      });
      ResponseHandler.sendSuccessResponse(res, records);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  };

  // GET 
  public getByEmployee = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid user ID"
      );
      return;
    }

    try {
      const record = await this.repo.findOne({
        where: { user: { id: userId } },
        relations: ["manager"],
      });

      if (!record) {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.NOT_FOUND,
          "No manager assigned to this user"
        );
        return;
      }

      ResponseHandler.sendSuccessResponse(res, record);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  };

public getAll = async (req: Request, res: Response): Promise<void> => {
  const requester: any = (req as any).user;

  try {
    if (requester.role?.name === "admin") {
      const all = await this.repo.find({
        relations: ["user", "user.role", "user.department", "manager"],
      });
      ResponseHandler.sendSuccessResponse(res, { data: all }, StatusCodes.OK);
      return;
    }

    if (requester.role?.name === "manager") {
      const team = await this.repo.find({
        where: { manager: { id: requester.id }, endDate: null },
        relations: ["user", "user.role", "user.department", "manager"],
      });
      ResponseHandler.sendSuccessResponse(res, { data: team }, StatusCodes.OK);
      return;
    }

    // anyone else (staff, etc.)
    ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, "Forbidden");
  } catch (err: any) {
    ResponseHandler.sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      err.message
    );
  }
};



  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid ID"
      );
      return;
    }

    try {
      const result = await this.repo.delete(id);
      if (result.affected === 0) {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.NOT_FOUND,
          "User-management record not found"
        );
        return;
      }

      ResponseHandler.sendSuccessResponse(
        res,
        "User-management link deleted",
        StatusCodes.OK
      );
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  };
}
