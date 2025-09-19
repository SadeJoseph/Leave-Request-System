import { Router } from "express";
import { UserManagementController } from "../controllers/UserManagementController";
import { adminOrAssignedManager } from "../middleware/AdminOrManager";
import { adminOnly } from "../middleware/AdminOnly";

export class UserManagementRouter {
  constructor(
    private router: Router,
    private userManagementController: UserManagementController
  ) {
    this.addRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private addRoutes(): void {

    this.router.get("/", adminOrAssignedManager,this.userManagementController.getAll);
    this.router.post("/", adminOnly, this.userManagementController.create);
    this.router.get("/manager/:managerId",adminOrAssignedManager, this.userManagementController.getByManager);
    this.router.get('/employee/:userId',adminOrAssignedManager, this.userManagementController.getByEmployee);
    this.router.delete('/:id',adminOnly, this.userManagementController.delete);

  }
}