import { Router } from "express";
import { DepartmentController } from "../controllers/DepartmentController";
import { adminOnly } from "../middleware/AdminOnly";

export class DepartmentRouter {
  constructor(
    private router: Router,
    private departmentController: DepartmentController
  ) {
    this.addRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private addRoutes(): void {
    this.router.get("/", adminOnly, this.departmentController.getAll);
    this.router.get('/:id',adminOnly, this.departmentController.getById);
    this.router.post("/", adminOnly,this.departmentController.create);
    this.router.delete("/:id",adminOnly, this.departmentController.delete);
  }
}
