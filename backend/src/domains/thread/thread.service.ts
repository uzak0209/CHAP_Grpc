import { db } from "../../lib/db.js";
import { CommentRepository } from "../comment/comment.repository.js";
import { UserLookupRepository } from "../shared/user-lookup.repository.js";
import type { CreateThreadInput, GetThreadByIdParams, GetThreadsQuery } from "./thread.schema.js";
import type { ThreadRecord } from "./thread.repository.js";
import { ThreadRepository } from "./thread.repository.js";

export class ThreadError extends Error {
  constructor(
    message: string,
    readonly status: 404,
  ) {
    super(message);
  }
}

const toThreadSummary = (thread: ThreadRecord) => ({
  id: thread.id,
  user_id: thread.userId,
  user_image: thread.userImage,
  like_count: thread.likeCount,
  user_name: thread.userName,
  content: thread.content,
  created_at: thread.createdAt.toISOString(),
  updated_at: thread.updatedAt.toISOString(),
  lat: thread.lat,
  lng: thread.lng,
  content_type: thread.contentType,
  image: thread.image,
});

export class ThreadService {
  private readonly threadRepository = new ThreadRepository(db);
  private readonly commentRepository = new CommentRepository(db);
  private readonly userLookupRepository = new UserLookupRepository(db);

  async createThread(userId: string, input: CreateThreadInput) {
    const user = await this.userLookupRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "failed to fetch user details",
      };
    }

    await this.threadRepository.create({
      userName: user.name,
      userId,
      userImage: user.image,
      content: input.content,
      image: input.image,
      lat: input.lat,
      lng: input.lng,
      contentType: input.content_type,
    });

    return {
      success: true,
      message: "thread created successfully",
    };
  }

  async getThreads(query: GetThreadsQuery) {
    const threads = await this.threadRepository.findMany(query.lat, query.lng);
    return {
      threads: threads.map((thread) => toThreadSummary(thread)),
    };
  }

  async getThreadById(params: GetThreadByIdParams) {
    const thread = await this.threadRepository.findById(params.threadId);
    if (!thread) {
      throw new ThreadError("thread not found", 404);
    }

    const comments = await this.commentRepository.findByThreadId(params.threadId);

    return {
      thread: {
        id: thread.id,
        user_id: thread.userId,
        user_image: thread.userImage,
        like_count: thread.likeCount,
        user_name: thread.userName,
        content: thread.content,
        created_at: thread.createdAt.toISOString(),
        updated_at: thread.updatedAt.toISOString(),
        image: thread.image,
      },
      comment: comments.map((comment) => ({
        id: comment.id,
        user_id: comment.userId,
        user_name: comment.userName,
        content: comment.content,
        created_at: comment.createdAt.toISOString(),
        updated_at: comment.updatedAt.toISOString(),
      })),
    };
  }
}
