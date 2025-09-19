import { Role } from "../Role";
import { validate } from "class-validator";

describe("Role Entity tests", () => {
  let role: Role;

  beforeEach(() => {
    role = new Role();
    role.name = "manager";
  });

  it("should be valid with a proper name", async () => {
    const errors = await validate(role);
    expect(errors.length).toBe(0);
  });

  it("should be invalid if name is missing", async () => {
    role.name = "";
    const errors = await validate(role);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isNotEmpty");
  });

  it("should be invalid if name exceeds 30 characters", async () => {
    role.name = "a".repeat(31);
    const errors = await validate(role);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("maxLength");
  });
});
