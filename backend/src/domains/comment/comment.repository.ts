import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

type DbClient = Pool;

export type CommentRecord = {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  image: string;
  parentCommentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapCommentRecord = (row: Record<string, unknown>): CommentRecord => ({
  id: String(row.id),
  threadId: String(row.thread_id),
  userId: String(row.user_id),
  userName: String(row.user_name ?? ""),
  userImage: String(row.user_image ?? ""),
  content: String(row.content ?? ""),
  image: String(row.image ?? ""),
  parentCommentId:
    row.parent_comment_id === null || row.parent_comment_id === undefined
      ? null
      : String(row.parent_comment_id),
  createdAt: new Date(String(row.created_at)),
  updatedAt: new Date(String(row.updated_at)),
});

export class CommentRepository {
  constructor(private readonly database: DbClient) {}

  async create(input: {
    threadId: string;
    userId: string;
    userName: string;
    userImage: string;
    content: string;
  }): Promise<void> {
    const now = new Date();

    await this.database.query(
      `insert into comment_db_models (
        id,
        thread_id,
        user_name,
        user_id,
        user_image,
        content,
        image,
        parent_comment_id,
        created_at,
        updated_at,
        deleted_at,
        valid
      ) values ($1, $2, $3, $4, $5, $6, '', null, $7, $8, null, true)`,
      [
        randomUUID(),
        input.threadId,
        input.userName,
        input.userId,
        input.userImage,
        input.content,
        now,
        now,
      ],
    );
  }

  async findByThreadId(threadId: string): Promise<CommentRecord[]> {
    const result = await this.database.query(
      `select
        id,
        thread_id,
        user_id,
        user_name,
        user_image,
        content,
        image,
        parent_comment_id,
        created_at,
        updated_at
       from comment_db_models
       where thread_id = $1 and deleted_at is null
       order by created_at asc`,
      [threadId],
    );

    return result.rows.map((row) => mapCommentRecord(row));
  }

  async findById(id: string): Promise<CommentRecord | null> {
    const result = await this.database.query(
      `select
        id,
        thread_id,
        user_id,
        user_name,
        user_image,
        content,
        image,
        parent_comment_id,
        created_at,
        updated_at
       from comment_db_models
       where id = $1 and deleted_at is null
       limit 1`,
      [id],
    );

    return result.rows[0] ? mapCommentRecord(result.rows[0]) : null;
  }

  async update(input: { id: string; content: string }): Promise<void> {
    await this.database.query(
      `update comment_db_models
       set content = $1, updated_at = $2
       where id = $3 and deleted_at is null`,
      [input.content, new Date(), input.id],
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.database.query(
      `update comment_db_models
       set deleted_at = $1, updated_at = $1
       where id = $2 and deleted_at is null`,
      [new Date(), id],
    );
  }
}
