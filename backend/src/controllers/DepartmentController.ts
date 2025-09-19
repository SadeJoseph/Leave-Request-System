import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Department } from "../entity/Department";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../helper/ResponseHandler";

export class DepartmentController {
  private departmentRepository: Repository<Department>;

  constructor() {
    this.departmentRepository = AppDataSource.getRepository(Department);
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const departments = await this.departmentRepository.find();
      if (!departments.length) {
        ResponseHandler.sendSuccessResponse(res, [], StatusCodes.NO_CONTENT);
        return;
      }
      ResponseHandler.sendSuccessResponse(res, departments);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const department = new Department();
      department.name = req.body.name;

      const errors = await validate(department);
      if (errors.length > 0) {
        throw new Error(
          errors.map((err) => Object.values(err.constraints || {})).join(", ")
        );
      }

      const saved = await this.departmentRepository.save(department);
      ResponseHandler.sendSuccessResponse(res, saved, StatusCodes.CREATED);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        error.message
      );
    }
  };

 
    public getById = async (req: Request, res: Response): Promise<void> => {    
        const id = parseInt(req.params.id);
    
        if (isNaN(id)) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format");
            return;
        }
    
        try{
            const department = await this.departmentRepository.findOne({ where: { id: id }});
            if (!department) {
                ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, `Department not found with ID: ${id}`);
                return;
            }
            
            ResponseHandler.sendSuccessResponse(res, department); 
        } catch (error) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve department");
        }                              
    };


  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    try {
      const result = await this.departmentRepository.delete(id);
      if (result.affected === 0) {
        throw new Error("Department not found");
      }
      ResponseHandler.sendSuccessResponse(
        res,
        "Department deleted",
        StatusCodes.OK
      );
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        error.message
      );
    }
  };
}
