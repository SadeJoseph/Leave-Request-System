import { Server } from "./Server";
import { Router } from "express";
import { AppDataSource } from "./data-source"; 
import { RoleRouter } from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { RoleController } from "./controllers/RoleController";
import { UserController } from "./controllers/UserController";
import { DepartmentRouter } from "./routes/DepartmentRouter";
import { DepartmentController } from "./controllers/DepartmentController";
import { UserManagementRouter } from "./routes/UserManagementRouter";
import { UserManagementController } from "./controllers/UserManagementController";
import { LeaveRequestRouter } from "./routes/LeaveRequestRouter";
import { LeaveRequestController } from "./controllers/LeaveRequestController";
import { LoginController } from "./controllers/LoginController";
import { LoginRouter } from "./routes/LoginRouter";


//Initialise the port
const DEFAULT_PORT = 8900
const port = process.env.SERVER_PORT || DEFAULT_PORT;
if (!process.env.SERVER_PORT) {
}

// Initialise the data source
const appDataSource = AppDataSource;

// Initialise routers
const roleRouter = new RoleRouter(Router(), new RoleController());
const userRouter = new UserRouter(Router(), new UserController());
const departmentRouter = new DepartmentRouter(Router(), new DepartmentController());
const userManagementRouter = new UserManagementRouter(Router(), new UserManagementController());
const leaveRequestRouter = new LeaveRequestRouter(Router(), new LeaveRequestController());
const loginRouter = new LoginRouter(Router(), new LoginController());

// Instantiate/start the server
const server = new Server(port, roleRouter, userRouter, departmentRouter, userManagementRouter, leaveRequestRouter,loginRouter, appDataSource);
server.start();