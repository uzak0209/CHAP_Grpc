import { randomUUID } from "node:crypto";

import type { Pool, PoolClient } from "pg";

type DbClient = Pool | PoolClient;

export type ThreadRecord = {
  id: string;
  userName: string;
  userId: string;
  userImage: string;
  content: string;
  image: string;
  likeCount: number;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
  contentType: string;
  valid: boolean;
};

const mapThreadRecord = (row: Record<string, unknown>): ThreadRecord => ({
  id: String(row.id),
  userName: String(row.user_name ?? ""),
  userId: String(row.user_id),
  userImage: String(row.user_image ?? ""),
  content: String(row.content ?? ""),
  image: String(row.image ?? ""),
  likeCount: Number(row.like_count ?? 0),
  lat: Number(row.lat ?? 0),
  lng: Number(row.lng ?? 0),
  createdAt: new Date(String(row.created_at)),
  updatedAt: new Date(String(row.updated_at)),
  contentType: String(row.content_type ?? ""),
  valid: Boolean(row.valid),
});

export class ThreadRepository {
  constructor(private readonly database: DbClient) {}

  async create(input: {
    id?: string;
    userName: string;
    userId: string;
    userImage?: string;
    content: string;
    image?: string;
    likeCount?: number;
    lat: number;
    lng: number;
    contentType?: string;
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Promise<string> {
    const id = input.id ?? randomUUID();
    const now = input.createdAt ?? new Date();
    const updatedAt = input.updatedAt ?? now;

    await this.database.query(
      `insert into thread_db_models (
        id,
        user_name,
        user_id,
        user_image,
        content,
        image,
        like_count,
        lat,
        lng,
        created_at,
        updated_at,
        deleted_at,
        content_type,
        valid
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, null, $12, $13)`,
      [
        id,
        input.userName,
        input.userId,
        input.userImage ?? "",
        input.content,
        input.image ?? "",
        input.likeCount ?? 0,
        input.lat,
        input.lng,
        now,
        updatedAt,
        input.contentType ?? "",
        input.valid ?? true,
      ],
    );

    return id;
  }

  async findById(id: string): Promise<ThreadRecord | null> {
    const result = await this.database.query(
      `select
        id,
        user_name,
        user_id,
        user_image,
        content,
        image,
        like_count,
        lat,
        lng,
        created_at,
        updated_at,
        content_type,
        valid
       from thread_db_models
       where id = $1 and deleted_at is null
       limit 1`,
      [id],
    );

    return result.rows[0] ? mapThreadRecord(result.rows[0]) : null;
  }

  async updateContent(input: {
    id: string;
    content: string;
    updatedAt?: Date;
  }): Promise<void> {
    await this.database.query(
      `update thread_db_models
       set content = $1, updated_at = $2
       where id = $3 and deleted_at is null`,
      [input.content, input.updatedAt ?? new Date(), input.id],
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.database.query(
      `update thread_db_models
       set deleted_at = $1, updated_at = $1
       where id = $2 and deleted_at is null`,
      [new Date(), id],
    );
  }

  async findMany(lat: number, lng: number): Promise<ThreadRecord[]> {
    const result = await this.database.query(
      `select
        id,
        user_name,
        user_id,
        user_image,
        content,
        image,
        like_count,
        lat,
        lng,
        created_at,
        updated_at,
        content_type,
        valid
       from thread_db_models
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

    return result.rows.map((row) => mapThreadRecord(row));
  }
}
