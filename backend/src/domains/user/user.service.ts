import { getDb } from "../../lib/db.js";
import type { FollowUserParams, GetUserByIdParams } from "./user.schema.js";
import { UserRepository } from "./user.repository.js";

export class UserError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404,
  ) {
    super(message);
  }
}

const toUserResponse = (user: NonNullable<Awaited<ReturnType<UserRepository["findWithRelations"]>>>) => ({
  id: user.id,
  name: user.name,
  description: user.description,
  image: user.image,
  followerCount: user.followerCount,
  followingCount: user.followingCount,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  followers: user.followers,
  followings: user.followings,
});

export class UserService {
  async getUser(params: GetUserByIdParams) {
    const user = await new UserRepository(getDb()).findWithRelations(params.userId);
    if (!user) {
      throw new UserError("user not found", 404);
    }

    return {
      user: toUserResponse(user),
    };
  }

  async getMe(userId: string) {
    const user = await new UserRepository(getDb()).findWithRelations(userId);
    if (!user) {
      throw new UserError("user not found", 404);
    }

    return {
      user: toUserResponse(user),
    };
  }

  async editUser(userId: string, input: { name: string; description: string; image: string }) {
    await new UserRepository(getDb()).updateProfile({
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
    await new UserRepository(getDb()).softDelete(userId);

    return {
      success: true,
    };
  }

  async followUser(userId: string, params: FollowUserParams) {
    const userRepository = new UserRepository(getDb());

    if (userId === params.targetUserId) {
      throw new UserError("cannot follow yourself", 400);
    }

    const [user, targetUser] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findById(params.targetUserId),
    ]);

    if (!user || !targetUser) {
      throw new UserError("user not found", 404);
    }

    await userRepository.createFollowRelation(userId, params.targetUserId);
    await userRepository.updateFollowCounts(userId, params.targetUserId);

    return {
      success: true,
    };
  }

  async unfollowUser(userId: string, params: FollowUserParams) {
    const userRepository = new UserRepository(getDb());

    if (userId === params.targetUserId) {
      throw new UserError("cannot unfollow yourself", 400);
    }

    const [user, targetUser] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findById(params.targetUserId),
    ]);

    if (!user || !targetUser) {
      throw new UserError("user not found", 404);
    }

    await userRepository.deleteFollowRelation(userId, params.targetUserId);
    await userRepository.updateFollowCounts(userId, params.targetUserId);

    return {
      success: true,
    };
  }
}
