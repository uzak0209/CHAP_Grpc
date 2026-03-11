import { randomUUID } from "node:crypto";

import { db } from "../../lib/db.js";
import { signUserToken } from "../../lib/jwt.js";
import type { SignInInput, SignUpInput } from "./auth.schema.js";
import { AuthRepository } from "./auth.repository.js";
import { UserRepository } from "./user.repository.js";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 409,
  ) {
    super(message);
  }
}

export class AuthService {
  private readonly authRepository = new AuthRepository(db);

  async signIn(input: SignInInput) {
    const auth = await this.authRepository.findByEmail(input.email);
    if (!auth || !auth.valid || auth.password !== input.password) {
      throw new AuthError("invalid credentials", 401);
    }

    return {
      success: true,
      message: "signed in successfully",
      token: signUserToken(auth.userId),
    };
  }

  async signUp(input: SignUpInput) {
    const existing = await this.authRepository.findByEmail(input.email);
    if (existing) {
      throw new AuthError("email already exists", 409);
    }

    const client = await db.connect();

    try {
      await client.query("begin");

      const userId = randomUUID();
      const now = new Date();

      const userRepository = new UserRepository(client);
      const authRepository = new AuthRepository(client);

      await userRepository.create({
        id: userId,
        name: input.name,
        createdAt: now,
        updatedAt: now,
        valid: true,
      });

      // Go 実装と互換性を保つため、この段階では平文パスワード保存を維持する。
      await authRepository.create({
        userId,
        email: input.email,
        password: input.password,
        valid: true,
      });

      await client.query("commit");

      return {
        success: true,
        message: "signed up successfully",
        token: signUserToken(userId),
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}
