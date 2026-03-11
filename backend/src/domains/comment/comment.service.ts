import { db } from "../../lib/db.js";
import { UserLookupRepository } from "../shared/user-lookup.repository.js";
import type {
  CreateCommentInput,
  DeleteCommentParams,
  EditCommentInput,
  GetCommentsByThreadIdParams,
} from "./comment.schema.js";
import { CommentRepository } from "./comment.repository.js";

export class CommentError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404,
  ) {
    super(message);
  }
}

export class CommentService {
  private readonly commentRepository = new CommentRepository(db);
  private readonly userLookupRepository = new UserLookupRepository(db);

  async createComment(userId: string, input: CreateCommentInput) {
    const user = await this.userLookupRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "failed to fetch user details",
      };
    }

    await this.commentRepository.create({
      threadId: input.thread_id,
      userId,
      userName: user.name,
      userImage: user.image,
      content: input.content,
    });

    return {
      success: true,
      message: "comment created successfully",
    };
  }

  async getCommentsByThreadId(params: GetCommentsByThreadIdParams) {
    const comments = await this.commentRepository.findByThreadId(params.threadId);

    return {
      comments: comments.map((comment) => ({
        id: comment.id,
        thread_id: comment.threadId,
        user_id: comment.userId,
        user_name: comment.userName,
        user_image: comment.userImage,
        content: comment.content,
        image: comment.image,
        parent_comment_id: comment.parentCommentId ?? "",
        like_count: 0,
        created_at: comment.createdAt.toISOString(),
        updated_at: comment.updatedAt.toISOString(),
        lat: 0,
        lng: 0,
        likes: [],
        content_type: "",
      })),
    };
  }

  async editComment(userId: string, input: EditCommentInput) {
    const comment = await this.commentRepository.findById(input.comment_id);
    if (!comment) {
      throw new CommentError("comment not found", 404);
    }
    if (comment.userId !== userId) {
      throw new CommentError("forbidden", 403);
    }

    await this.commentRepository.update({
      id: input.comment_id,
      content: input.content,
    });

    return {
      success: true,
      message: "comment updated successfully",
    };
  }

  async deleteComment(userId: string, params: DeleteCommentParams) {
    const comment = await this.commentRepository.findById(params.commentId);
    if (!comment) {
      throw new CommentError("comment not found", 404);
    }
    if (comment.userId !== userId) {
      throw new CommentError("forbidden", 403);
    }

    await this.commentRepository.softDelete(params.commentId);

    return {
      success: true,
      message: "comment deleted successfully",
    };
  }
}
