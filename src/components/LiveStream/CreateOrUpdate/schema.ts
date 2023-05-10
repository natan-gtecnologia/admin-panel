import { z } from "zod";

export const createOrUpdateSchema = z.object({
  title: z.string().min(3, "Mínimo de 3 caracteres"),
  afterLiveTime: z.number().min(1, "Mínimo de 1 minuto"),
  scheduledStartTime: z.date().min(new Date(), "Data inválida"),
  shortDescription: z.string().min(3, "Mínimo de 3 caracteres"),
  initialLiveText: z.string().min(3, "Mínimo de 3 caracteres"),
  chatReleased: z.boolean(),
  aiTags: z.array(z.string()).min(1, "Mínimo de 1 tag"),
  liveCover: z.any(),
  products: z
    .array(
      z.object({
        id: z.number(),
        livePrice: z.number().min(0.01, "Mínimo de 0.01"),
        highlighted: z.boolean(),
      })
    )
    .min(1, "Mínimo de 1 produto"),
  coupons: z.array(z.number()),
  broadcasters: z.array(z.number()),
});

export type CreateOrUpdateSchemaType = z.infer<typeof createOrUpdateSchema>;
