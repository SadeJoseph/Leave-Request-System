import { Router } from "express";
import { UserController } from '../controllers/UserController';
import { adminOnly } from "../middleware/AdminOnly";

export class UserRouter {
  constructor(private router: Router, 
            private userController: UserController) {
    this.addRoutes(); 
  }

  public getRouter(): Router {
    return this.router;
  } 

  private addRoutes() {
    this.router.delete('/:id', adminOnly, this.userController.delete);  
    this.router.get('/', adminOnly, this.userController.getAll);  
    this.router.get('/email/:emailAddress',adminOnly, this.userController.getByEmail); 
    this.router.get('/:id',adminOnly, this.userController.getById); 
    this.router.post('/',adminOnly, this.userController.create);  
    this.router.patch('/', adminOnly,this.userController.update);
    this.router.patch('/:id/reset-balance', adminOnly, this.userController.resetBalance);
    this.router.patch('/reset-all-balances', adminOnly, this.userController.resetAllBalances);

  }
}