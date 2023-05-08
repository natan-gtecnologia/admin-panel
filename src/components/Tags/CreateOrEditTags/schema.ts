import { z } from 'zod';
import { metaData } from '../../../utils/metaData';

export const tagsSchema = z.object({
  tag: z.string().min(1).max(50),
  color: z.string().min(1).max(50),
  metaData: z.array(metaData).optional().default([]),
});

export type CreateOrUpdateTagsSchemaProps = z.infer<typeof tagsSchema>;
