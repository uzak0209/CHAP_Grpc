import { randomUUID } from "node:crypto";

import type { Pool, PoolClient } from "pg";

type DbClient = Pool | PoolClient;

export type PostRecord = {
  id: string;
  userName: string;
  userImage: string;
  content: string;
  image: string;
  likeCount: number;
  lat: number;
  lng: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  contentType: string;
  valid: boolean;
};

const mapPostRecord = (row: Record<string, unknown>): PostRecord => ({
  id: String(row.id),
  userName: String(row.user_name ?? ""),
  userImage: String(row.user_image ?? ""),
  content: String(row.content ?? ""),
  image: String(row.image ?? ""),
  likeCount: Number(row.like_count ?? 0),
  lat: Number(row.lat ?? 0),
  lng: Number(row.lng ?? 0),
  userId: String(row.user_id),
  createdAt: new Date(String(row.created_at)),
  updatedAt: new Date(String(row.updated_at)),
  contentType: String(row.content_type ?? ""),
  valid: Boolean(row.valid),
});

export class PostRepository {
  constructor(private readonly database: DbClient) {}

  async create(input: {
    id?: string;
    userName: string;
    userImage?: string;
    content: string;
    image?: string;
    likeCount?: number;
    lat: number;
    lng: number;
    userId: string;
    contentType?: string;
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Promise<string> {
    const id = input.id ?? randomUUID();
    const now = input.createdAt ?? new Date();
    const updatedAt = input.updatedAt ?? now;

    await this.database.query(
      `insert into post_db_models (
        id,
        user_name,
        user_image,
        content,
        image,
        like_count,
        lat,
        lng,
        user_id,
        created_at,
        updated_at,
        deleted_at,
        content_type,
        valid
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, null, $12, $13)`,
      [
        id,
        input.userName,
        input.userImage ?? "",
        input.content,
        input.image ?? "",
        input.likeCount ?? 0,
        input.lat,
        input.lng,
        input.userId,
        now,
        updatedAt,
        input.contentType ?? "",
        input.valid ?? true,
      ],
    );

    return id;
  }

  async findById(id: string): Promise<PostRecord | null> {
    const result = await this.database.query(
      `select
        id,
        user_name,
        user_image,
        content,
        image,
        like_count,
        lat,
        lng,
        user_id,
        created_at,
        updated_at,
        content_type,
        valid
       from post_db_models
       where id = $1 and deleted_at is null
       limit 1`,
      [id],
    );

    return result.rows[0] ? mapPostRecord(result.rows[0]) : null;
  }

  async update(input: {
    id: string;
    userName: string;
    userImage?: string;
    content: string;
    image?: string;
    likeCount: number;
    lat: number;
    lng: number;
    userId: string;
    contentType?: string;
    valid: boolean;
    updatedAt?: Date;
  }): Promise<void> {
    await this.database.query(
      `update post_db_models
       set user_name = $1,
           user_image = $2,
           content = $3,
           image = $4,
           like_count = $5,
           lat = $6,
           lng = $7,
           user_id = $8,
           updated_at = $9,
           content_type = $10,
           valid = $11
       where id = $12 and deleted_at is null`,
      [
        input.userName,
        input.userImage ?? "",
        input.content,
        input.image ?? "",
        input.likeCount,
        input.lat,
        input.lng,
        input.userId,
        input.updatedAt ?? new Date(),
        input.contentType ?? "",
        input.valid,
        input.id,
      ],
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.database.query(
      `update post_db_models
       set deleted_at = $1, updated_at = $1
       where id = $2 and deleted_at is null`,
      [new Date(), id],
    );
  }

  async findMany(lat: number, lng: number): Promise<PostRecord[]> {
    const result = await this.database.query(
      `select
        id,
        user_name,
        user_image,
        content,
        image,
        like_count,
        lat,
        lng,
        user_id,
        created_at,
        updated_at,
        content_type,
        valid
       from post_db_models
       where deleted_at is null
         and (
           content_type = 'disaster'
           or content_type = 'entertainment'
           or (
             content_type = 'community'
             and lat between $1 and $2
             and lng between $3 and $4
           )
         )
       order by created_at desc`,
      [lat - 0.1, lat + 0.1, lng - 0.1, lng + 0.1],
    );

    return result.rows.map((row) => mapPostRecord(row));
  }
}
