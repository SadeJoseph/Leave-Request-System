import { AuthMiddleware } from "../AuthMiddleware";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ResponseHandler } from "../../helper/ResponseHandler"

jest.mock("jsonwebtoken");
jest.mock("../../helper/ResponseHandler");

describe("AuthMiddleware", () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as unknown as Response;

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next and attach decoded token to req.user", () => {
    const mockTokenPayload = {
      token: {
        id: 1,
        email: "test@example.com",
        role: { id: 1, name: "admin" }
      }
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockTokenPayload);

    const req = {
      headers: {
        authorization: "Bearer mocktoken"
      }
    } as unknown as Request;

    AuthMiddleware.verifyToken(req, mockRes, next);

    expect(jwt.verify).toHaveBeenCalledWith("mocktoken", process.env.JWT_SECRET!);
    expect((req as any).user).toEqual(mockTokenPayload.token);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if no token is provided", () => {
    const req = {
      headers: {}
    } as unknown as Request;

    AuthMiddleware.verifyToken(req, mockRes, next);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 401, "No token provided");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const req = {
      headers: {
        authorization: "Bearer invalidtoken"
      }
    } as unknown as Request;

    AuthMiddleware.verifyToken(req, mockRes, next);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 401, "Invalid token");
    expect(next).not.toHaveBeenCalled();
  });
});
