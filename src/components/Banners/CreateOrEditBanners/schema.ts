import { z } from 'zod';
import { metaData } from '../../../utils/metaData';

export const bannersSchema = z.object({
  title: z.string().min(1).max(50),
  page_link: z.string().nullable(),
  page: z.enum(['homepage', 'products', 'product']).nullable(),
  link_type: z.enum(['product', 'category', 'page']).nullable(),
  type: z.enum(['hero', 'section']).nullable(),
  order: z.number(),

  desktop_image: z.any(),
  desktop_image_id: z.number().nullable(),
  mobile_image: z.any(),
  mobile_image_id: z.number().nullable(),
  
  category_link: z.any(),
  category_link_id: z.number().optional().nullable(),
  product_link: z.any(),
  product_link_id: z.number().optional().nullable(),

});

export type CreateOrUpdateBannerSchemaProps = z.infer<typeof bannersSchema>;
