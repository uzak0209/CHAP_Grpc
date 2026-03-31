import { z } from "zod";

export const getEventsQuerySchema = z.object({
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
  content_type: z.string().optional().default(""),
});

export type GetEventsQuery = z.infer<typeof getEventsQuerySchema>;
export type GetEventByIdParams = z.infer<typeof getEventByIdParamsSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
