import type { Pool } from "pg";

type DbClient = Pool;

export type UserLookupRecord = {
  id: string;
  name: string;
  image: string;
};

export class UserLookupRepository {
  constructor(private readonly database: DbClient) {}

  async findById(id: string): Promise<UserLookupRecord | null> {
    const result = await this.database.query(
      `select id, name, image
       from user_db_models
       where id = $1 and deleted_at is null
       limit 1`,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: String(row.id),
      name: String(row.name ?? ""),
      image: String(row.image ?? ""),
    };
  }
}
