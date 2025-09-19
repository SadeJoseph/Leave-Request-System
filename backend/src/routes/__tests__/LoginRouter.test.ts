import request from "supertest";
import express, { Router } from "express";
import { LoginRouter } from "../LoginRouter";
import { LoginController } from "../../controllers/LoginController";
import { StatusCodes } from "http-status-codes";

const mockLoginController = {
  login: jest.fn((req, res) => res.status(StatusCodes.ACCEPTED).json({ token: "mocked.jwt.token" }))
} as unknown as LoginController;

// Spy on router
const router = Router();
jest.spyOn(router, "post");

const app = express();
app.use(express.json());

const loginRouter = new LoginRouter(router, mockLoginController);
app.use("/api/login", loginRouter.getRouter());

describe("LoginRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/login calls LoginController.login", async () => {
    const loginPayload = {
      email: "test@example.com",
      password: "MySecurePassword123"
    };

    const response = await request(app)
      .post("/api/login")
      .send(loginPayload);

    expect(mockLoginController.login).toHaveBeenCalled();
    expect(response.status).toBe(StatusCodes.ACCEPTED);
    expect(response.body).toEqual({ token: "mocked.jwt.token" });
  });
});
