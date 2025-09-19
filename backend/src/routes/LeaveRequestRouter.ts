
import { Router } from "express";
import { LeaveRequestController } from "../controllers/LeaveRequestController";
import { adminOrAssignedManager } from "../middleware/AdminOrManager";


export class LeaveRequestRouter {
  constructor(
    private router: Router,
    private controller: LeaveRequestController
  ) {
    this.addRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private addRoutes(): void {
    this.router.post("/", this.controller.create);
    this.router.get("/mine", this.controller.getMine);
    this.router.get("/", adminOrAssignedManager, this.controller.getAllForReviewer);
    this.router.patch("/:id/approve", adminOrAssignedManager, this.controller.approve);
    this.router.patch("/:id/reject", adminOrAssignedManager, this.controller.reject);
    this.router.delete("/:id", adminOrAssignedManager, this.controller.cancel);
  }
}
