import express, { Request, Response } from "express";
import { DataSource } from "typeorm";
import { RoleRouter } from "./routes/RoleRouter";
import { StatusCodes } from "http-status-codes";
import morgan, { StreamOptions } from "morgan";
import { Logger } from "./helper/Logger";
import { ResponseHandler } from "./helper/ResponseHandler";
import { UserRouter } from "./routes/UserRouter";
import { DepartmentRouter } from "./routes/DepartmentRouter";
import { UserManagementRouter } from "./routes/UserManagementRouter";
import { LeaveRequestRouter } from "./routes/LeaveRequestRouter";
import { LoginRouter } from "./routes/LoginRouter";
import { AuthMiddleware } from "./middleware/AuthMiddleware";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export class Server {
  private readonly app: express.Application;

  constructor(
    private readonly port: string | number,
    private readonly roleRouter: RoleRouter,
    private readonly userRouter: UserRouter,
    private readonly departmentRouter: DepartmentRouter,
    private readonly userManagementRouter: UserManagementRouter,
    private readonly leaveRequestRouter: LeaveRequestRouter,
    private readonly loginRouter: LoginRouter,
    private readonly appDataSource: DataSource
  ) {
    this.app = express();

    this.initialiseMiddlewares();
    this.initialiseRoutes();
    this.initialiseErrorHandling();
  }

  private initialiseMiddlewares() {
    const morganStream: StreamOptions = {
      write: (message: string): void => {
        Logger.info(message.trim());
      },
    };

    this.app.use(express.json());
    this.app.use(morgan("combined", { stream: morganStream }));
    this.app.use(helmet());

    this.app.use(
      cors({
        origin: "http://localhost:8000", // dev server
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // General API limiter (per IP)
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // safer default
      handler: (req, res) => {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.TOO_MANY_REQUESTS,
          "Too many requests from this IP. Please slow down."
        );
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use("/api", apiLimiter);

    // Stricter limit for login
    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, // only 5 attempts
      handler: (req, res) => {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.TOO_MANY_REQUESTS,
          "Too many login attempts. Please try again later."
        );
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Only apply to POST /api/login
    this.app.use("/api/login", loginLimiter);
  }

  private initialiseRoutes() {
    this.app.use("/api/login", this.loginRouter.getRouter());
    this.app.use(AuthMiddleware.verifyToken);

    this.app.use("/api/roles", this.roleRouter.getRouter());
    this.app.use("/api/users", this.userRouter.getRouter());
    this.app.use("/api/departments", this.departmentRouter.getRouter());
    this.app.use("/api/user-management", this.userManagementRouter.getRouter());
    this.app.use("/api/leave-requests", this.leaveRequestRouter.getRouter());
  }

  private initialiseErrorHandling() {
    this.app.use("/", (req: Request, res: Response) => {
      const requestedUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Route " + requestedUrl + " not found"
      );
    });
  }

  public async start() {
    await this.initialiseDataSource();
    this.app.listen(this.port, () => {
      Logger.info(`Server running on http://localhost:${this.port}`);
    });
  }

  private async initialiseDataSource() {
    try {
      await this.appDataSource.initialize();
      Logger.info("Data Source initialised");
    } catch (error) {
      Logger.error("Error during initialisation:", error);
      throw error;
    }
  }
}
