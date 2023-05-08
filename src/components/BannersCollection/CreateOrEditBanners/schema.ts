import { z } from 'zod';

export const bannersSchema = z.object({
  title: z.string().min(1, 'O título deve ter no mínimo 1 caracter').max(50),
  page_link: z.string().nullable(),
  page: z.enum(['homepage', 'products', 'product', 'layout'], {invalid_type_error: 'Selecione um valor'}),
  link_type: z.enum(['product', 'category', 'page']).nullable(),
  type: z.enum(['hero', 'section'], {invalid_type_error: 'Selecione um valor'}).nullable(),
  order: z.number(),
  banner: z.array(z.object({
    order: z.any(),
    banner: z.any(),
    type: z.enum(['hero', 'header', 'section', 'footer']),
  })),
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
