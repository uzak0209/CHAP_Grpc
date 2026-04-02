import { z } from "zod";

export const getEventsSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const getEventByIdParamsSchema = z.object({
  eventId: z.string().min(1),
});

export const createEventSchema = z.object({
  content: z.string().min(1),
  image: z.string().optional().default(""),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  event_date: z.string().optional().default(""),
  content_type: z.string().optional().default(""),
});

export const editEventSchema = z.object({
  event_id: z.string().min(1),
  event_date: z.string().optional().default(""),
  content: z.string().min(1),
  image: z.string().optional().default(""),
});

export const deleteEventParamsSchema = z.object({
  eventId: z.string().min(1),
});

export type GetEventsInput = z.infer<typeof getEventsSchema>;
export type GetEventByIdParams = z.infer<typeof getEventByIdParamsSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EditEventInput = z.infer<typeof editEventSchema>;
export type DeleteEventParams = z.infer<typeof deleteEventParamsSchema>;
