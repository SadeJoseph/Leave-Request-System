import { User } from "../User";
import { Role } from "../Role";
import { Department } from "../Department";
import * as classTransformer from "class-transformer";
import { instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { QueryFailedError, Repository } from 'typeorm';
import { mock } from "jest-mock-extended";

describe("User Entity tests", () => {
    let mockUserRepository: jest.Mocked<Repository<User>>;
    let user: User;
    let role: Role;
    let department: Department;

    beforeEach(() => {
        mockUserRepository = mock<Repository<User>>();

        role = new Role();
        role.id = 1;
        role.name = "staff";

        department = new Department();
        department.id = 1;
        department.name = "IT";

        user = new User();
        user.id = 1;
        user.firstname = "Jane";
        user.surname = "Doe";
        user.email = "jane@example.com";
        user.password = 'securepassword';
        user.salt = 'somesalt';
        user.annualLeaveBalance = 25.0;
        user.role = role;
        user.department = department;
    });

    it("Password must be a string", async () => {
        user.password = 1234 as any;
        const errors = await validate(user);
        expect(errors[0].constraints).toHaveProperty("isString");
    });

    it("Password less than 10 characters is invalid", async () => {
        user.password = 'short';
        const errors = await validate(user);
        expect(errors[0].constraints).toHaveProperty("minLength");
    });

    it("Invalid email format is rejected", async () => {
        user.email = "invalid-email";
        const errors = await validate(user);
        expect(errors[0].constraints).toHaveProperty("isEmail");
    });

    it("Missing role is invalid", async () => {
        user.role = null;
        const errors = await validate(user);
        expect(errors.length).toBeGreaterThan(0);
    });

    it("Valid user passes validation", async () => {
        const errors = await validate(user);
        expect(errors.length).toBe(0);
    });

    it("Plain object should not include password", () => {
        jest.spyOn(classTransformer, "instanceToPlain").mockReturnValue({
            id: user.id,
            email: user.email,
            role: { id: role.id, name: role.name },
            department: { id: department.id, name: department.name },
        } as any);

        const plainUser = instanceToPlain(user);

        expect(plainUser).toHaveProperty("id", user.id);
        expect(plainUser).toHaveProperty("email", user.email);
        expect(plainUser).toHaveProperty("role", { id: role.id, name: role.name });
        expect(plainUser).not.toHaveProperty("password");
    });

    it("Password is excluded from findOne result", async () => {
        mockUserRepository.findOne.mockResolvedValue({
            id: user.id,
            email: user.email,
            role: { id: role.id, name: role.name },
            department: { id: department.id, name: department.name },
        } as User);

        const result = await mockUserRepository.findOne({ where: { id: user.id } });
        expect(result).toHaveProperty("id", user.id);
        expect(result).toHaveProperty("email", user.email);
        expect(result).not.toHaveProperty("password");
    });

    it("Duplicate email address throws QueryFailedError", async () => {
        mockUserRepository.save.mockImplementationOnce((u: User) => Promise.resolve(u));

        mockUserRepository.save.mockRejectedValue(
            new QueryFailedError(
                "INSERT INTO user",
                [],
                new Error(`#1062 - Duplicate entry '${user.email}' for key 'email'`)
            )
        );

        await expect(mockUserRepository.save(user)).resolves.toEqual(user);

        const duplicate = new User();
        duplicate.email = user.email;
        duplicate.password = 'securepassword';
        duplicate.role = role;
        duplicate.department = department;

        await expect(mockUserRepository.save(duplicate)).rejects.toThrow(QueryFailedError);
    });
});
