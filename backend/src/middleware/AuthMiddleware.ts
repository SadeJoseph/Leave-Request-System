import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../helper/ResponseHandler";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const AuthMiddleware = {
  verifyToken: (req: Request, res: Response, next: NextFunction): void => {
    //  Skip login route
    if (req.path === "/api/login" || req.originalUrl.startsWith("/api/login")) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "No token provided");
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
   
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser & {
        iat: number;
        exp: number;
      };

      (req as AuthenticatedRequest).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Invalid token");
    }
  },
};
