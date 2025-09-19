import { Router } from "express";  
import { RoleController } from '../controllers/RoleController';
import { adminOnly } from "../middleware/AdminOnly";

export class RoleRouter {
    private router: Router; 
    private roleController: RoleController;

    constructor(router: Router, roleController: RoleController) {
        this.router = router;
        this.roleController = roleController;
        this.addRoutes(); 
    }

    public getRouter(): Router {
        return this.router;
    } 

    private addRoutes() {
        this.router.delete('/:id', adminOnly, this.roleController.delete); 
        this.router.get('/', adminOnly, this.roleController.getAll);  
        this.router.get('/:id', adminOnly, this.roleController.getById);
        this.router.post('/', adminOnly, this.roleController.create);  
        this.router.patch('/', adminOnly, this.roleController.update);
    }
}