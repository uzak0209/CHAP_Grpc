import { db } from "../../lib/db.js";
import { UserLookupRepository } from "../shared/user-lookup.repository.js";
import type { CreateEventInput, GetEventByIdParams, GetEventsQuery } from "./event.schema.js";
import type { EventRecord } from "./event.repository.js";
import { EventRepository } from "./event.repository.js";

export class EventError extends Error {
  constructor(
    message: string,
    readonly status: 404,
  ) {
    super(message);
  }
}

const toEventSummary = (event: EventRecord) => ({
  id: event.id,
  user_name: event.userName,
  user_id: event.userId,
  user_image: event.userImage,
  content: event.content,
  image: event.image,
  like_count: event.likeCount,
  created_at: event.createdAt.toISOString(),
  updated_at: event.updatedAt.toISOString(),
  lat: event.lat,
  lng: event.lng,
  event_date: event.eventDate.toISOString(),
  content_type: event.contentType,
});

export class EventService {
  private readonly eventRepository = new EventRepository(db);
  private readonly userLookupRepository = new UserLookupRepository(db);

  async createEvent(userId: string, input: CreateEventInput) {
    const user = await this.userLookupRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "failed to fetch user details",
      };
    }

    await this.eventRepository.create({
      userName: user.name,
      userId,
      userImage: user.image,
      content: input.content,
      image: input.image,
      lat: input.lat,
      lng: input.lng,
      contentType: input.content_type,
      eventDate: new Date(),
      title: input.content,
    });

    return {
      success: true,
      message: "event created successfully",
    };
  }

  async getEvents(query: GetEventsQuery) {
    const events = await this.eventRepository.findMany(query.lat, query.lng);
    return {
      events: events.map((event) => toEventSummary(event)),
    };
  }

  async getEventById(params: GetEventByIdParams) {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event) {
      throw new EventError("event not found", 404);
    }

    return {
      event: {
        ...toEventSummary(event),
        title: event.title,
      },
    };
  }
}
