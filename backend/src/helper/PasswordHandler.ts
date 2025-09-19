import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import dotenv from 'dotenv';
dotenv.config({ path: ".env.development" });

export class PasswordHandler {
  private static readonly SALT_LENGTH_IN_BYTES = 16;
  private static readonly KEY_LENGTH_IN_BYTES = 64;
  private static readonly PEPPER = process.env.PEPPER || "";

  static hashPassword(password: string): { hashedPassword: string; salt: string } {
    const salt = randomBytes(this.SALT_LENGTH_IN_BYTES).toString("hex");

    const hashedPassword = scryptSync(
      this.PEPPER + password,
      salt,
      this.KEY_LENGTH_IN_BYTES
    ).toString("hex");

    return { hashedPassword, salt };
  }

  static verifyPassword(
    password: string,
    hashedPassword: string,
    salt: string
  ): boolean {
    const hashToCompare = scryptSync(
      this.PEPPER + password,
      salt,
      this.KEY_LENGTH_IN_BYTES
    ).toString("hex");

    return timingSafeEqual(
      Buffer.from(hashedPassword, "hex"),
      Buffer.from(hashToCompare, "hex")
    );
  }
}