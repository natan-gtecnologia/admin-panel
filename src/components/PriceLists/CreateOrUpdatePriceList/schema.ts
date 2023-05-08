import { z } from 'zod';
import { currencyMask } from '../../../utils/masks';

export const priceListSchema = z
  .object({
    name: z.string().min(1, 'O nome da lista de preços não pode ser vazio'),
    productPrices: z.array(
      z.object({
        product: z
          .number({
            invalid_type_error: 'É necessário selecionar um produto',
          })
          .min(1, 'O produto não pode ser vazio'),
        price: z.object({
          regularPrice: z
            .string({
              required_error: 'O preço deve ser maior que 0.',
            })
            .min(1, 'O preço deve ser maior que 0.')
            .transform((value) =>
              value ? currencyMask.transform(value) : value,
            )
            .refine((value) => value > 0, 'O preço deve ser maior que 0.'),
          salePrice: z
            .string({
              required_error: 'O preço deve ser maior que 0.',
            })
            .min(1, 'O preço deve ser maior que 0.')
            .transform((value) =>
              value ? currencyMask.transform(value) : value,
            )
            .refine((value) => value > 0, 'O preço deve ser maior que 0.'),
        }),
      }),
    ),

    enabled: z.boolean().default(false),
    company: z.number().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.productPrices.length === 0) {
      return ctx.addIssue({
        code: 'custom',
        message: 'A lista de preços deve conter pelo menos um produto',
      });
    }
  });

export type CreateOrUpdatePriceListSchema = z.infer<typeof priceListSchema>;
