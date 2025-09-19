import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { ResponseHandler } from "../helper/ResponseHandler";
import { PasswordHandler } from "../helper/PasswordHandler";
import { StatusCodes } from "http-status-codes";
import { validate } from "class-validator";

export class UserController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  // Get all users
  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.find({
        relations: ["role", "department"], 
      });

      if (users.length === 0) {
        ResponseHandler.sendSuccessResponse(res, StatusCodes.NO_CONTENT);
      }

      ResponseHandler.sendSuccessResponse(res, users);
    } catch (error) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve users: ${error.message}`
      );
    }
  };

  // Get user by email
  public getByEmail = async (req: Request, res: Response): Promise<void> => {
    const email = req.params.emailAddress;

    if (!email || email.trim().length === 0) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Email is required"
      );
      return;
    }

    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
        relations: ["role", "department"],
      }); 
      if (!user) {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.NOT_FOUND,
          `User not found with email: ${email}`
        );
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);
    } catch (error) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `Unable to find user with the email: {$email}`
      );
    }
  };

  // Get user by ID
  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid ID format"
      );
      return;
    }

    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        relations: ["role", "department"],
      }); //add epartment
      if (!user) {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.NO_CONTENT,
          `User not found with ID: ${id}`
        );
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);
    } catch (error) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `Error fetching user: {$error.message}`
      );
    }
  };

  // Add a new user
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      let user = new User();
      user.firstname = req.body.firstname;
      user.surname = req.body.surname;
      user.email = req.body.email;
     
    const { hashedPassword, salt } = PasswordHandler.hashPassword(req.body.password);
    user.password = hashedPassword;
    user.salt = salt;
      user.role = req.body.roleId;
      user.department = req.body.departmentId;
      user.annualLeaveBalance = req.body.annualLeaveBalance ?? 25;

      const errors = await validate(user);
      if (errors.length > 0) {
      
        throw new Error(
          errors.map((err) => Object.values(err.constraints || {})).join(", ")
        );
      }

      user = await this.userRepository.save(user);

      ResponseHandler.sendSuccessResponse(res, user, StatusCodes.CREATED);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        error.message
      );
    }
  };

  // Delete a user
  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
      if (!id) {
        throw new Error("No ID provided");
      }

      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new Error("User with the provided ID not found");
      }

      ResponseHandler.sendSuccessResponse(res, "User deleted", StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        error.message
      );
    }
  };

  // Update details
  public update = async (req: Request, res: Response): Promise<void> => {
    const id = req.body.id;
    try {
      if (!id) {
        throw new Error("id not found");
      }

      let user = await this.userRepository.findOneBy({ id });
 
      if (!user) {
        throw new Error("User not found");
      }

      // Update specific fields
      user.firstname = req.body.firstname;
      user.surname = req.body.surname;
      user.email = req.body.email;
      user.role = req.body.roleId;
      user.department = req.body.departmentId;
      user.annualLeaveBalance =
        req.body.annualLeaveBalance ?? user.annualLeaveBalance;

      const errors = await validate(user);
      if (errors.length > 0) {
      
        throw new Error(
          errors.map((err) => Object.values(err.constraints || {})).join(", ")
        );
      }

      user = await this.userRepository.save(user);

      ResponseHandler.sendSuccessResponse(res, user, StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        error.message
      );
    }
  };

// so that an admin can resent a users balance back to 25
public resetBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    user.annualLeaveBalance = 25.0; // Reset to default

    const updated = await this.userRepository.save(user);
    ResponseHandler.sendSuccessResponse(res, updated, StatusCodes.OK);
  } catch (error: any) {
    ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
  }
};
// so an admin can reset all users balances 
public resetAllBalances = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await this.userRepository.find();

    for (const user of users) {
      user.annualLeaveBalance = 25.0; // Reset to default
    }

    const updatedUsers = await this.userRepository.save(users);
    ResponseHandler.sendSuccessResponse(res, updatedUsers, StatusCodes.OK);
  } catch (error: any) {
    ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

}
