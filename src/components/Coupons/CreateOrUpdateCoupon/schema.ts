import { z } from 'zod';

import { api } from '../../../services/apiClient';

export const createOrUpdateSchema = z
  .object({
    description: z.string().optional(),
    discount: z.number().min(0).optional().nullable(),
    code: z.string(),
    method: z.enum(['code', 'auto']).default('code'),
    type: z
      .enum([
        'all_store',
        'specific_products',
        'specific_categories',
        'specific_customers',
        'free_shipping_by_region',
        'free_shipping_by_products',
        'buy_and_earn_by_products',
        'buy_and_earn_by_categories',
        'buy_and_earn_by_cart_price',
      ])
      .default('all_store'),
    accumulative: z.boolean().default(false).nullable(),
    discountType: z.enum(['percentage', 'price']).default('percentage'),
    enabled: z.boolean(),
    initialDate: z
      .string()
      .optional()
      .nullable()
      .transform((value) => {
        if (!value) return value;

        const date = new Date(value);

        return date.toISOString();
      }),
    finalDate: z
      .string()
      .optional()
      .nullable()
      .transform((value) => {
        if (!value) return value;

        const date = new Date(value);

        return date.toISOString();
      }),

    shippingType: z
      .enum(['to_shipping', 'free_shipping', 'not_apply'])
      .default('not_apply'),
    shippingDiscountType: z.enum(['percentage', 'price']).default('price'),
    shippingDiscount: z.number().optional().default(0),

    maximumUseQuantity: z.number().optional().default(undefined).nullable(),
    useQuantity: z.number().optional(),
    useQuantityByCustomer: z
      .array(
        z.object({
          customer: z.number().nullable(),
          quantity: z.number().nullable(),
        }),
      )
      .nullable(),
    minimumProductQuantity: z.number().optional().nullable(),
    accumulatedDiscountLimit: z.number().optional().nullable(),

    initialCepRange: z.string().optional().nullable(),
    finalCepRange: z.string().optional().nullable(),

    minimumCartAmount: z.number().min(0).nullable(),

    buyAndEarnProducts: z
      .array(
        z.object({
          buyProducts: z.object({
            product: z.number().nullable(),
            quantity: z.number().nullable(),
          }),
          earnProducts: z.object({
            product: z.number().nullable(),
            quantity: z.number().nullable(),
          }),
        }),
      )
      .optional(),
  })
  .refine((data) => !(data.method === 'code' && !data.code.trim()), {
    path: ['code'],
    message: 'O código é obrigatório',
  })
  .superRefine(async (data, ctx) => {
    if (
      data.type === 'free_shipping_by_region' &&
      (!data.initialCepRange || !data.finalCepRange)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'É necessário informar uma região válida',
        path: ['initialCepRange'],
      });
    }

    if (data.method === 'code' && data.code.length > 0) {
      try {
        const response = await api.get(`/coupons/code/${data.code}`);

        if (response.data.data) {
          ctx.addIssue({
            code: 'custom',
            message: 'Código de desconto já existe',
            path: ['code'],
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (data.type === 'buy_and_earn_by_products' && data.buyAndEarnProducts) {
      const hasEmptyProduct = data.buyAndEarnProducts.some(
        (item) => !item.buyProducts.product || !item.earnProducts.product,
      );

      if (hasEmptyProduct) {
        ctx.addIssue({
          code: 'custom',
          message: 'A quantidade de produtos devem ser iguais',
          path: ['buyAndEarnProducts'],
        });
      }
    }
  });

export type CreateOrUpdateCouponSchemaProps = z.infer<
  typeof createOrUpdateSchema
>;
