import type { Pool, PoolClient } from "pg";

type DbClient = Pool | PoolClient;

export type UserRecord = {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  followerCount: number;
  followingCount: number;
  valid: boolean;
};

export type UserWithRelations = UserRecord & {
  followers: string[];
  followings: string[];
};

const mapUserRecord = (row: Record<string, unknown>): UserRecord => ({
  id: String(row.id),
  name: String(row.name ?? ""),
  description: String(row.description ?? ""),
  image: String(row.image ?? ""),
  createdAt: new Date(String(row.created_at)),
  updatedAt: new Date(String(row.updated_at)),
  followerCount: Number(row.follower_count ?? 0),
  followingCount: Number(row.following_count ?? 0),
  valid: Boolean(row.valid),
});

export class UserRepository {
  constructor(private readonly database: DbClient) {}

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.database.query(
      `select
        id,
        name,
        description,
        image,
        created_at,
        updated_at,
        follower_count,
        following_count,
        valid
       from user_db_models
       where id = $1 and deleted_at is null
       limit 1`,
      [id],
    );

    return result.rows[0] ? mapUserRecord(result.rows[0]) : null;
  }

  async updateProfile(input: {
    id: string;
    name: string;
    description: string;
    image: string;
    updatedAt?: Date;
  }): Promise<void> {
    await this.database.query(
      `update user_db_models
       set name = $1,
           description = $2,
           image = $3,
           updated_at = $4
       where id = $5 and deleted_at is null`,
      [
        input.name,
        input.description,
        input.image,
        input.updatedAt ?? new Date(),
        input.id,
      ],
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.database.query(
      `update user_db_models
       set deleted_at = $1, updated_at = $1
       where id = $2 and deleted_at is null`,
      [new Date(), id],
    );
  }

  async findWithRelations(id: string): Promise<UserWithRelations | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    const [followersResult, followingsResult] = await Promise.all([
      this.database.query(
        `select follower_id
         from user_follower_db_models
         where following_id = $1`,
        [id],
      ),
      this.database.query(
        `select following_id
         from user_following_db_models
         where follower_id = $1`,
        [id],
      ),
    ]);

    return {
      ...user,
      followers: followersResult.rows.map((row) => String(row.follower_id)),
      followings: followingsResult.rows.map((row) => String(row.following_id)),
    };
  }
}
