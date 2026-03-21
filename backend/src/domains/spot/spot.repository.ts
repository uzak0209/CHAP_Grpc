import { randomUUID } from "node:crypto";

import type { Pool, PoolClient } from "pg";

type DbClient = Pool | PoolClient;

export type SpotRecord = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
  valid: boolean;
  userId: string;
  description: string;
};

const mapSpotRecord = (row: Record<string, unknown>): SpotRecord => ({
  id: String(row.id),
  title: String(row.title ?? ""),
  lat: Number(row.lat ?? 0),
  lng: Number(row.lng ?? 0),
  createdAt: new Date(String(row.created_at)),
  updatedAt: new Date(String(row.updated_at)),
  valid: Boolean(row.valid),
  userId: String(row.user_id),
  description: String(row.description ?? ""),
});

export class SpotRepository {
  constructor(private readonly database: DbClient) {}

  async create(input: {
    id?: string;
    title: string;
    lat: number;
    lng: number;
    valid?: boolean;
    userId: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Promise<string> {
    const id = input.id ?? randomUUID();
    const now = input.createdAt ?? new Date();
    const updatedAt = input.updatedAt ?? now;

    await this.database.query(
      `insert into spot_db_models (
        id,
        title,
        lat,
        lng,
        created_at,
        updated_at,
        valid,
        deleted_at,
        user_id,
        description
      ) values ($1, $2, $3, $4, $5, $6, $7, null, $8, $9)`,
      [
        id,
        input.title,
        input.lat,
        input.lng,
        now,
        updatedAt,
        input.valid ?? true,
        input.userId,
        input.description ?? "",
      ],
    );

    return id;
  }

  async update(input: {
    id: string;
    title: string;
    lat: number;
    lng: number;
    valid: boolean;
    userId: string;
    description?: string;
    updatedAt?: Date;
  }): Promise<void> {
    await this.database.query(
      `update spot_db_models
       set title = $1,
           lat = $2,
           lng = $3,
           updated_at = $4,
           valid = $5,
           user_id = $6,
           description = $7
       where id = $8 and deleted_at is null`,
      [
        input.title,
        input.lat,
        input.lng,
        input.updatedAt ?? new Date(),
        input.valid,
        input.userId,
        input.description ?? "",
        input.id,
      ],
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.database.query(
      `update spot_db_models
       set deleted_at = $1, updated_at = $1
       where id = $2 and deleted_at is null`,
      [new Date(), id],
    );
  }

  async findManyByUserId(userId: string): Promise<SpotRecord[]> {
    const result = await this.database.query(
      `select
        id,
        title,
        lat,
        lng,
        created_at,
        updated_at,
        valid,
        user_id,
        description
       from spot_db_models
       where user_id = $1 and deleted_at is null`,
      [userId],
    );

    return result.rows.map((row) => mapSpotRecord(row));
  }
}
