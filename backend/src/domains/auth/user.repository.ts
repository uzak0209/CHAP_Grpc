import type { PoolClient } from "pg";

export class UserRepository {
  constructor(private readonly client: PoolClient) {}

  async create(input: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    valid: boolean;
  }): Promise<void> {
    await this.client.query(
      `insert into user_db_models (
        id,
        name,
        description,
        image,
        created_at,
        updated_at,
        follower_count,
        following_count,
        valid,
        deleted_at
      ) values ($1, $2, '', '', $3, $4, 0, 0, $5, null)`,
      [input.id, input.name, input.createdAt, input.updatedAt, input.valid],
    );
  }
}
