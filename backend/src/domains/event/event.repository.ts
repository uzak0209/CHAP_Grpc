import type { Pool, PoolClient } from "pg";

type DbClient = Pool | PoolClient;

export type EventRecord = {
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
  eventDate: Date;
  contentType: string;
  title: string;
  valid: boolean;
};

const mapEventRecord = (row: Record<string, unknown>): EventRecord => ({
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
  eventDate: new Date(String(row.event_date)),
  contentType: String(row.content_type ?? ""),
  title: String(row.title ?? ""),
  valid: Boolean(row.valid),
});

export class EventRepository {
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
    eventDate: Date;
    contentType?: string;
    title: string;
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Promise<string> {
    const id = input.id ?? crypto.randomUUID();
    const now = input.createdAt ?? new Date();
    const updatedAt = input.updatedAt ?? now;

    await this.database.query(
      `insert into event_db_models (
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
        event_date,
        content_type,
        title,
        valid
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, null, $12, $13, $14, $15)`,
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
        input.eventDate,
        input.contentType ?? "",
        input.title,
        input.valid ?? true,
      ],
    );

    return id;
  }

  async findById(id: string): Promise<EventRecord | null> {
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
        event_date,
        content_type,
        title,
        valid
       from event_db_models
       where id = $1 and deleted_at is null
       limit 1`,
      [id],
    );

    return result.rows[0] ? mapEventRecord(result.rows[0]) : null;
  }

  async update(input: {
    id: string;
    userName: string;
    userId: string;
    userImage?: string;
    content: string;
    image?: string;
    likeCount: number;
    lat: number;
    lng: number;
    eventDate: Date;
    contentType?: string;
    title: string;
    valid: boolean;
    updatedAt?: Date;
  }): Promise<void> {
    await this.database.query(
      `update event_db_models
       set user_name = $1,
           user_id = $2,
           user_image = $3,
           content = $4,
           image = $5,
           like_count = $6,
           lat = $7,
           lng = $8,
           updated_at = $9,
           event_date = $10,
           content_type = $11,
           title = $12,
           valid = $13
       where id = $14 and deleted_at is null`,
      [
        input.userName,
        input.userId,
        input.userImage ?? "",
        input.content,
        input.image ?? "",
        input.likeCount,
        input.lat,
        input.lng,
        input.updatedAt ?? new Date(),
        input.eventDate,
        input.contentType ?? "",
        input.title,
        input.valid,
        input.id,
      ],
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.database.query(
      `update event_db_models
       set deleted_at = $1, updated_at = $1
       where id = $2 and deleted_at is null`,
      [new Date(), id],
    );
  }

  async findMany(lat: number, lng: number): Promise<EventRecord[]> {
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
        event_date,
        content_type,
        title,
        valid
       from event_db_models
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

    return result.rows.map((row) => mapEventRecord(row));
  }
}
