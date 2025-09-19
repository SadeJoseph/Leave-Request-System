import { LeaveRequest } from "../LeaveRequest";
import { User } from "../User";
import { validate } from "class-validator";

describe("LeaveRequest Entity tests", () => {
  let leave: LeaveRequest;
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 1;
    user.email = "employee@example.com";
    user.password = "validPassword123";

    leave = new LeaveRequest();
    leave.user = user;
    leave.startDate = new Date("2024-06-01");
    leave.endDate = new Date("2024-06-03");
    leave.leaveType = "Annual Leave";
    leave.reason = "Family trip";
    leave.status = "Pending";
  });

  it("should be valid with correct fields", async () => {
    const errors = await validate(leave);
    expect(errors.length).toBe(0);
  });

  it("should be invalid without a user", async () => {
    leave.user = null;
    const errors = await validate(leave);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be valid without a reason", async () => {
    leave.reason = null;
    const errors = await validate(leave);
    expect(errors.length).toBe(0);
  });


});
