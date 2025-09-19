import { Department } from "../Department";
import { validate } from "class-validator";

describe("Department Entity tests", () => {
  let dept: Department;

  beforeEach(() => {
    dept = new Department();
    dept.name = "Technology";
  });

  it("should be valid with a proper name", async () => {
    const errors = await validate(dept);
    expect(errors.length).toBe(0);
  });

  it("should be invalid if name is empty", async () => {
    dept.name = "";
    const errors = await validate(dept);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isNotEmpty");
  });

  it("should be invalid if name exceeds 100 characters", async () => {
    dept.name = "a".repeat(101);
    const errors = await validate(dept);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("maxLength");
  });
});
