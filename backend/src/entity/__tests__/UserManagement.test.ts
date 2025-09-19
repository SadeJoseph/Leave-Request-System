
import { User } from "../User";
import { UserManagement } from "../UserManagement";
import { validate } from "class-validator";

describe("UserManagement Entity tests", () => {
  let entity: UserManagement;
  let employee: User;
  let manager: User;

  beforeEach(() => {
    employee = new User();
    employee.id = 10;
    employee.email = "user@email.com";
    employee.password = "password1234";

    manager = new User();
    manager.id = 5;
    manager.email = "manager@email.com";
    manager.password = "password5678";

    entity = new UserManagement();
    entity.user = employee;
    entity.manager = manager;
    entity.startDate = new Date("2024-01-01");
    entity.endDate = null;
  });

  it("should be valid with required fields", async () => {
    const errors = await validate(entity);
    expect(errors.length).toBe(0);
  });

  it("should be invalid if user is missing", async () => {
    entity.user = null;
    const errors = await validate(entity);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be invalid if manager is missing", async () => {
    entity.manager = null;
    const errors = await validate(entity);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("allows nullable endDate", async () => {
    entity.endDate = null;
    const errors = await validate(entity);
    expect(errors.length).toBe(0);
  });
});
