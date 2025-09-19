import { AppDataSource } from '../data-source'; 
import { User } from '../entity/User';
import { Repository } from "typeorm";
import { ResponseHandler } from '../helper/ResponseHandler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PasswordHandler } from '../helper/PasswordHandler';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: ".env.development" });

export class LoginController {
    public static readonly ERROR_NO_EMAIL_PROVIDED = "No email provided";
    public static readonly ERROR_NO_PASSWORD_PROVIDED = "No password provided";
    public static readonly ERROR_USER_NOT_FOUND = "User not found";
    public static readonly ERROR_PASSWORD_INCORRECT = "Password incorrect";

    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || email.trim().length === 0) {
                throw new Error(LoginController.ERROR_NO_EMAIL_PROVIDED);
            }

            if (!password || password.trim().length === 0) {
                throw new Error(LoginController.ERROR_NO_PASSWORD_PROVIDED);
            }

            const user = await this.userRepository.createQueryBuilder("user")
                .addSelect(["user.password", "user.salt"])
                .leftJoinAndSelect("user.role", "role")
                .where("user.email = :email", { email })
                .getOne();

            if (!user) {
                throw new Error(LoginController.ERROR_USER_NOT_FOUND);
            }

            const isMatch = PasswordHandler.verifyPassword(password, user.password, user.salt);
            if (!isMatch) {
                throw new Error(LoginController.ERROR_PASSWORD_INCORRECT);
            }

           
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role, 
            };

            const signedJwt = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: '30d' });

            res.status(StatusCodes.ACCEPTED).json({
                token: signedJwt,
                user: payload,
            });

        } catch (error: any) {
            ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
        }
    };
}

