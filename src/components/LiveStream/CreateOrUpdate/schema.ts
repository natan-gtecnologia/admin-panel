import { z } from "zod";

export const createOrUpdateSchema = z.object({
  title: z.string().min(3, "Mínimo de 3 caracteres"),
});

export type CreateOrUpdateSchemaType = z.infer<typeof createOrUpdateSchema>;
