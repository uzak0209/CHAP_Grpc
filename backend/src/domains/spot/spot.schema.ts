import { z } from "zod";

export const createSpotSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const editSpotSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const deleteSpotParamsSchema = z.object({
  spotId: z.string().min(1),
});

export type CreateSpotInput = z.infer<typeof createSpotSchema>;
export type EditSpotInput = z.infer<typeof editSpotSchema>;
export type DeleteSpotParams = z.infer<typeof deleteSpotParamsSchema>;
