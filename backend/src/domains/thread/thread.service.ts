import { db } from "../../lib/db.js";
import { CommentRepository } from "../comment/comment.repository.js";
import { UserLookupRepository } from "../shared/user-lookup.repository.js";
import type {
  CreateThreadInput,
  DeleteThreadParams,
  EditThreadInput,
  GetThreadByIdParams,
  GetThreadsInput,
} from "./thread.schema.js";
import type { ThreadRecord } from "./thread.repository.js";
import { ThreadRepository } from "./thread.repository.js";

export class ThreadError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404,
  ) {
    super(message);
  }
}

const toThreadSummary = (thread: ThreadRecord) => ({
  id: thread.id,
  userId: thread.userId,
  userImage: thread.userImage,
  likeCount: thread.likeCount,
  userName: thread.userName,
  content: thread.content,
  createdAt: thread.createdAt.toISOString(),
  updatedAt: thread.updatedAt.toISOString(),
  lat: thread.lat,
  lng: thread.lng,
  contentType: thread.contentType,
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

  async getThreads(input: GetThreadsInput) {
    const threads = await this.threadRepository.findMany(input.lat, input.lng);
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
        userId: thread.userId,
        userImage: thread.userImage,
        likeCount: thread.likeCount,
        userName: thread.userName,
        content: thread.content,
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
        image: thread.image,
      },
      comment: comments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        userName: comment.userName,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    };
  }

  async editThread(userId: string, input: EditThreadInput) {
    const thread = await this.threadRepository.findById(input.thread_id);
    if (!thread) {
      throw new ThreadError("thread not found", 404);
    }
    if (thread.userId !== userId) {
      throw new ThreadError("forbidden", 403);
    }

    await this.threadRepository.updateContent({
      id: input.thread_id,
      content: input.content,
    });

    return {
      success: true,
      message: "thread updated successfully",
    };
  }

  async deleteThread(userId: string, params: DeleteThreadParams) {
    const thread = await this.threadRepository.findById(params.threadId);
    if (!thread) {
      throw new ThreadError("thread not found", 404);
    }
    if (thread.userId !== userId) {
      throw new ThreadError("forbidden", 403);
    }

    await this.threadRepository.softDelete(params.threadId);

    return {
      success: true,
      message: "thread deleted successfully",
    };
  }
}
