import { db } from "../../lib/db.js";
import type { GetUserByIdParams } from "./user.schema.js";
import { UserRepository } from "./user.repository.js";

export class UserError extends Error {
  constructor(
    message: string,
    readonly status: 404,
  ) {
    super(message);
  }
}

const toUserResponse = (user: NonNullable<Awaited<ReturnType<UserRepository["findWithRelations"]>>>) => ({
  id: user.id,
  name: user.name,
  description: user.description,
  image: user.image,
  follower_count: user.followerCount,
  following_count: user.followingCount,
  created_at: user.createdAt.toISOString(),
  updated_at: user.updatedAt.toISOString(),
  followers: user.followers,
  followings: user.followings,
});

export class UserService {
  private readonly userRepository = new UserRepository(db);

  async getUser(params: GetUserByIdParams) {
    const user = await this.userRepository.findWithRelations(params.userId);
    if (!user) {
      throw new UserError("user not found", 404);
    }

    return {
      user: toUserResponse(user),
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findWithRelations(userId);
    if (!user) {
      throw new UserError("user not found", 404);
    }

    return {
      user: toUserResponse(user),
    };
  }

  async editUser(userId: string, input: { name: string; description: string; image: string }) {
    await this.userRepository.updateProfile({
      id: userId,
      name: input.name,
      description: input.description,
      image: input.image,
    });

    return {
      success: true,
    };
  }

  async deleteUser(userId: string) {
    await this.userRepository.softDelete(userId);

    return {
      success: true,
    };
  }
}
