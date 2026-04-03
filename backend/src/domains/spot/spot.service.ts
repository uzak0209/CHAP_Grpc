import { getDb } from "../../lib/db.js";
import type { CreateSpotInput, DeleteSpotParams, EditSpotInput } from "./spot.schema.js";
import type { SpotRecord } from "./spot.repository.js";
import { SpotRepository } from "./spot.repository.js";

const toSpotResponse = (spot: SpotRecord) => ({
  id: spot.id,
  title: spot.title,
  description: spot.description,
  lat: spot.lat,
  lng: spot.lng,
  createdAt: spot.createdAt.toISOString(),
  updatedAt: spot.updatedAt.toISOString(),
});

export class SpotError extends Error {
  constructor(
    message: string,
    readonly status: 404,
  ) {
    super(message);
  }
}

export class SpotService {
  async createSpot(userId: string, input: CreateSpotInput) {
    await new SpotRepository(getDb()).create({
      userId,
      title: input.title,
      description: input.description,
      lat: input.lat,
      lng: input.lng,
    });

    return {
      success: true,
      message: "spot created successfully",
    };
  }

  async getSpots(userId: string) {
    const spots = await new SpotRepository(getDb()).findManyByUserId(userId);
    return {
      spots: spots.map((spot) => toSpotResponse(spot)),
    };
  }

  async editSpot(userId: string, input: EditSpotInput) {
    const spotRepository = new SpotRepository(getDb());
    const current = (await spotRepository.findManyByUserId(userId)).find((spot) => spot.id === input.id);
    if (!current) {
      throw new SpotError("spot not found", 404);
    }

    await spotRepository.update({
      id: current.id,
      userId,
      title: input.title,
      description: input.description,
      lat: input.lat,
      lng: input.lng,
      valid: current.valid,
    });

    return {
      success: true,
      message: "spot updated successfully",
    };
  }

  async deleteSpot(userId: string, params: DeleteSpotParams) {
    const spotRepository = new SpotRepository(getDb());
    const current = (await spotRepository.findManyByUserId(userId)).find((spot) => spot.id === params.spotId);
    if (!current) {
      throw new SpotError("spot not found", 404);
    }

    await spotRepository.softDelete(params.spotId);

    return {
      success: true,
      message: "spot deleted successfully",
    };
  }
}
