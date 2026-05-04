import type { Pool, PoolClient } from "pg";

type DbClient = Pool | PoolClient;

export type AuthRecord = {
  userId: string;
  email: string;
  password: string;
  valid: boolean;
};

const mapAuthRecord = (row: Record<string, unknown>): AuthRecord => ({
  userId: String(row.user_id),
  email: String(row.email),
  password: String(row.password),
  valid: Boolean(row.valid),
});

export class AuthRepository {
  constructor(private readonly database: DbClient) {}

  async findByEmail(email: string): Promise<AuthRecord | null> {
    const result = await this.database.query(
      `select user_id, email, password, valid
       from auth_db_models
       where email = $1
       limit 1`,
      [email],
    );

    return result.rows[0] ? mapAuthRecord(result.rows[0]) : null;
  }

  async create(input: {
    userId: string;
    email: string;
    password: string;
    valid: boolean;
  }): Promise<void> {
    await this.database.query(
      `insert into auth_db_models (user_id, email, password, valid)
       values ($1, $2, $3, $4)`,
      [input.userId, input.email, input.password, input.valid],
    );
  }
}
