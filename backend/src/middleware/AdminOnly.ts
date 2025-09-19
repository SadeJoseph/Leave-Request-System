import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../helper/ResponseHandler";

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user || user.role?.name !== "admin") {
    ResponseHandler.sendErrorResponse(res, 403, "Admin only");
    return;
  }

  next();
};
