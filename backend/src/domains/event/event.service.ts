import { getDb } from "../../lib/db.js";
import { UserLookupRepository } from "../shared/user-lookup.repository.js";
import type {
  CreateEventInput,
  DeleteEventParams,
  EditEventInput,
  GetEventByIdParams,
  GetEventsInput,
} from "./event.schema.js";
import type { EventRecord } from "./event.repository.js";
import { EventRepository } from "./event.repository.js";

export class EventError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404,
  ) {
    super(message);
  }
}

const toEventSummary = (event: EventRecord) => ({
  id: event.id,
  userName: event.userName,
  userId: event.userId,
  userImage: event.userImage,
  content: event.content,
  image: event.image,
  likeCount: event.likeCount,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
  lat: event.lat,
  lng: event.lng,
  eventDate: event.eventDate.toISOString(),
  contentType: event.contentType,
});

export class EventService {
  async createEvent(userId: string, input: CreateEventInput) {
    const database = getDb();
    const userLookupRepository = new UserLookupRepository(database);
    const eventRepository = new EventRepository(database);

    const user = await userLookupRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "failed to fetch user details",
      };
    }

    await eventRepository.create({
      userName: user.name,
      userId,
      userImage: user.image,
      content: input.content,
      image: input.image,
      lat: input.lat,
      lng: input.lng,
      contentType: input.content_type,
      eventDate: input.event_date ? new Date(input.event_date) : new Date(),
      title: input.content,
    });

    return {
      success: true,
      message: "event created successfully",
    };
  }

  async getEvents(input: GetEventsInput) {
    const events = await new EventRepository(getDb()).findMany(input.lat, input.lng);
    return {
      events: events.map((event) => toEventSummary(event)),
    };
  }

  async getEventById(params: GetEventByIdParams) {
    const eventRepository = new EventRepository(getDb());
    const event = await eventRepository.findById(params.eventId);
    if (!event) {
      throw new EventError("event not found", 404);
    }

    return {
      event: {
        ...toEventSummary(event),
        title: event.title,
      },
      comment: [],
    };
  }

  async editEvent(userId: string, input: EditEventInput) {
    const eventRepository = new EventRepository(getDb());
    const event = await eventRepository.findById(input.event_id);
    if (!event) {
      throw new EventError("event not found", 404);
    }
    if (event.userId !== userId) {
      throw new EventError("forbidden", 403);
    }

    await eventRepository.update({
      id: event.id,
      userName: event.userName,
      userId: event.userId,
      userImage: event.userImage,
      content: input.content,
      image: input.image,
      likeCount: event.likeCount,
      lat: event.lat,
      lng: event.lng,
      eventDate: input.event_date ? new Date(input.event_date) : event.eventDate,
      contentType: event.contentType,
      title: event.title,
      valid: event.valid,
    });

    return {
      success: true,
      message: "event updated successfully",
    };
  }

  async deleteEvent(userId: string, params: DeleteEventParams) {
    const eventRepository = new EventRepository(getDb());
    const event = await eventRepository.findById(params.eventId);
    if (!event) {
      throw new EventError("event not found", 404);
    }
    if (event.userId !== userId) {
      throw new EventError("forbidden", 403);
    }

    await eventRepository.softDelete(params.eventId);

    return {
      success: true,
      message: "event deleted successfully",
    };
  }
}
