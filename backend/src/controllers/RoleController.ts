import { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; 
import { Role } from '../entity/Role';
import { Repository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../helper/ResponseHandler';
import { validate } from "class-validator";

export class RoleController {
    private roleRepository: Repository<Role>;

    constructor() {
        this.roleRepository = AppDataSource.getRepository(Role);
    }

  
    public getAll = async (req: Request, res: Response): Promise<void> =>{
        try{
            const roles = await this.roleRepository.find();
    
            if (roles.length === 0) {
                ResponseHandler.sendErrorResponse(res,StatusCodes.NO_CONTENT);  
                return;
            }
    
            res.send(roles);
        } catch (error) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR," Failed to retrieve roles");
        }                              
    };

   
    public getById = async (req: Request, res: Response): Promise<void> => {    
        const id = parseInt(req.params.id);
    
        if (isNaN(id)) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format");
            return;
        }
    
        try{
            const role = await this.roleRepository.findOne({ where: { id: id }});
            if (!role) {
                ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, `Role not found with ID: ${id}`);
                return;
            }
            
            ResponseHandler.sendSuccessResponse(res, role); 
        } catch (error) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve role");
        }                              
    };

   
    public create = async (req: Request, res: Response): Promise<void> => {
        try {
        
            let role = new Role();
            role.name = req.body.name;

            const errors = await validate(role);
            if (errors.length > 0) {
                throw new Error("Name is blank");
            } 

            role = await this.roleRepository.save(role); 
            ResponseHandler.sendSuccessResponse(res, role, StatusCodes.CREATED); 
    
        } catch (error: any) { 
            ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
        }
    };

    
    // Delete a role
    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
    
        try {
            if (!id) {
                throw new Error("No ID provided");
            }
    
            const result = await this.roleRepository.delete(id);
    
            if (result.affected === 0) {
                throw new Error("Role with the provided ID not found");
            }
    
            ResponseHandler.sendSuccessResponse(res, "Role deleted"); 

        } catch (error: any) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, error.message);
        }
    };

    
    // Update dept details
    public update = async (req: Request, res: Response): Promise<void> => {
        const id = req.body.id;
    
        try {
            let role = await this.roleRepository.findOneBy({ id });
    
            if (!role) {
                throw new Error("Role not found");
            }
    
            // Update specific fields
            role.name = req.body.name;
            const errors = await validate(role);
            if (errors.length > 0) {
                throw new Error("Name is blank");
            }

            role = await this.roleRepository.save(role);
    
            ResponseHandler.sendSuccessResponse(res, role); 
        } catch (error: any) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
        }
    };
}