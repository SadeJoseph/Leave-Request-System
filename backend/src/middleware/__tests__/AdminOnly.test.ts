import { adminOnly } from "../AdminOnly";
import { ResponseHandler } from "../../helper/ResponseHandler";
import { Request, Response, NextFunction } from "express";

jest.mock("../../helper/ResponseHandler");


describe("adminOnly middleware", () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() if user is admin", () => {
    const req = {
      user: {
        role: {
          name: "admin",
        },
      },
    } as any as Request;

    adminOnly(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect(ResponseHandler.sendErrorResponse).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not admin", () => {
    const req = {
      user: {
        role: {
          name: "manager",
        },
      },
    } as any as Request;

    adminOnly(req, mockRes, next);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 403, "Admin only");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user is missing", () => {
    const req = {} as any as Request;

    adminOnly(req, mockRes, next);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 403, "Admin only");
    expect(next).not.toHaveBeenCalled();
  });
});
