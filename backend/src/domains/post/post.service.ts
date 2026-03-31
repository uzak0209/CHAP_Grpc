import { db } from "../../lib/db.js";
import { UserLookupRepository } from "../shared/user-lookup.repository.js";
import type { CreatePostInput, GetPostsQuery } from "./post.schema.js";
import type { PostRecord } from "./post.repository.js";
import { PostRepository } from "./post.repository.js";

const toPostSummary = (post: PostRecord) => ({
  id: post.id,
  user_name: post.userName,
  user_id: post.userId,
  user_image: post.userImage,
  content: post.content,
  image: post.image,
  like_count: post.likeCount,
  created_at: post.createdAt.toISOString(),
  updated_at: post.updatedAt.toISOString(),
  lat: post.lat,
  lng: post.lng,
  content_type: post.contentType,
});

export class PostService {
  private readonly postRepository = new PostRepository(db);
  private readonly userLookupRepository = new UserLookupRepository(db);

  async createPost(userId: string, input: CreatePostInput) {
    const user = await this.userLookupRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "failed to fetch user details",
      };
    }

    await this.postRepository.create({
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

  async getPosts(query: GetPostsQuery) {
    const posts = await this.postRepository.findMany(query.lat, query.lng);
    return {
      posts: posts.map((post) => toPostSummary(post)),
    };
  }
}
