import { getDb } from "../../lib/db.js";
import { UserLookupRepository } from "../shared/user-lookup.repository.js";
import type {
  CreatePostInput,
  DeletePostParams,
  EditPostInput,
  GetPostsByUserIdParams,
  GetPostsInput,
} from "./post.schema.js";
import type { PostRecord } from "./post.repository.js";
import { PostRepository } from "./post.repository.js";

export class PostError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404,
  ) {
    super(message);
  }
}

const toPostSummary = (post: PostRecord) => ({
  id: post.id,
  userName: post.userName,
  userId: post.userId,
  userImage: post.userImage,
  content: post.content,
  image: post.image,
  likeCount: post.likeCount,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  lat: post.lat,
  lng: post.lng,
  contentType: post.contentType,
});

export class PostService {
  async createPost(userId: string, input: CreatePostInput) {
    const database = getDb();
    const userLookupRepository = new UserLookupRepository(database);
    const postRepository = new PostRepository(database);

    const user = await userLookupRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "failed to fetch user details",
      };
    }

    await postRepository.create({
      userName: user.name,
      userImage: user.image,
      userId,
      content: input.content,
      image: input.image,
      lat: input.lat,
      lng: input.lng,
      contentType: input.content_type,
    });

    return {
      success: true,
      message: "post created successfully",
    };
  }

  async getPosts(input: GetPostsInput) {
    const posts = await new PostRepository(getDb()).findMany(input.lat, input.lng);
    return {
      posts: posts.map((post) => toPostSummary(post)),
    };
  }

  async getPostsByUserId(params: GetPostsByUserIdParams) {
    const posts = await new PostRepository(getDb()).findManyByUserId(params.userId);
    return {
      posts: posts.map((post) => toPostSummary(post)),
    };
  }

  async editPost(userId: string, input: EditPostInput) {
    const postRepository = new PostRepository(getDb());
    const post = await postRepository.findById(input.post_id);
    if (!post) {
      throw new PostError("post not found", 404);
    }
    if (post.userId !== userId) {
      throw new PostError("forbidden", 403);
    }

    await postRepository.update({
      id: post.id,
      userName: post.userName,
      userImage: post.userImage,
      content: input.content,
      image: input.image,
      likeCount: post.likeCount,
      lat: post.lat,
      lng: post.lng,
      userId: post.userId,
      contentType: post.contentType,
      valid: post.valid,
    });

    return {
      success: true,
      message: "post updated successfully",
    };
  }

  async deletePost(userId: string, params: DeletePostParams) {
    const postRepository = new PostRepository(getDb());
    const post = await postRepository.findById(params.postId);
    if (!post) {
      throw new PostError("post not found", 404);
    }
    if (post.userId !== userId) {
      throw new PostError("forbidden", 403);
    }

    await postRepository.softDelete(params.postId);

    return {
      success: true,
      message: "post deleted successfully",
    };
  }
}
