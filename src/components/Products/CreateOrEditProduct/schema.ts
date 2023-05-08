import { z } from 'zod';
import { currencyMask } from '../../../utils/masks';
import { metaData } from '../../../utils/metaData';
import { validateProductSlug } from './slugValidationProduct';

export const createOrEditProductSchema = z
  .object({
    id: z.number().nullable(),
    title: z
      .string()
      .min(1, 'O título deve conter no mínimo 1 caracter.')
      .max(1000, 'O título deve conter no máximo 1000 caracteres.'),
    slug: z
      .string()
      .min(1, 'O slug deve conter no mínimo 1 caracter.')
      .max(1000, 'O slug deve conter no máximo 1000 caracteres.')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'O slug deve conter apenas letras minúsculas e números.',
      ),
    description: z
      .string()
      .optional()
      .transform((value) => {
        return value ? value.replace(/(&nbsp; ?){2,}/gm, '') : value;
      }),
    shortDescription: z
      .string()
      .max(250, 'A descrição deve conter no máximo 100 caracteres.')
      .optional()
      .nullable()
      .transform((value) => {
        return value ? value.trim() : value;
      }),
    groupType: z.enum(['simple', 'grouped', 'kit']).default('simple'),
    status: z.enum(['available', 'not_available']).default('available'),
    productType: z.enum(['physical', 'digital']).default('physical'),
    manufacturer: z.string().max(100).optional(),
    featured: z.boolean().default(false),
    sku: z.string().min(1, 'O SKU deve conter no mínimo 1 caracter.'),
    price: z.object({
      regularPrice: z
        .string({
          required_error: 'O preço deve ser maior que 0.',
        })
        .min(1, 'O preço deve ser maior que 0.')
        .transform((value) => (value ? currencyMask.transform(value) : value))
        .refine((value) => value > 0, 'O preço deve ser maior que 0.'),
      salePrice: z
        .string({
          required_error: 'O preço deve ser maior que 0.',
        })
        .min(1, 'O preço deve ser maior que 0.')
        .transform((value) => (value ? currencyMask.transform(value) : value))
        .refine((value) => value > 0, 'O preço deve ser maior que 0.'),
    }),
    dimension: z
      .object({
        width: z.string().nullable(),
        height: z.string().nullable(),
        weight: z.string().nullable(),
        length: z.string().nullable(),
      })
      .nullable()
      .transform((value) => {
        if (!value) {
          return null;
        }

        return {
          width: value.width ? currencyMask.transform(value.width) : null,
          height: value.height ? currencyMask.transform(value.height) : null,
          weight: value.weight ? currencyMask.transform(value.weight) : null,
          length: value.length ? currencyMask.transform(value.length) : null,
        };
      }),
    product_image: z.any(),
    images: z.array(
      z.number({
        invalid_type_error: 'Selecionar uma imagem.',
      }),
    ),
    product_image_id: z.number().nullable(),
    categories: z.array(
      z.number({
        invalid_type_error: 'Selecionar uma categoria.',
      }),
    ),
    tags: z.array(
      z.number({
        invalid_type_error: 'Selecionar uma tag.',
      }),
    ),
    stockStatus: z
      .enum(['in_stock', 'out_of_stock', 'on_back_order'])
      .default('in_stock'),
    stockQuantity: z
      .number({
        invalid_type_error: 'O estoque deve ser um número.',
      })
      .min(0, 'O estoque deve ser maior ou igual a 0.'),
    brand: z
      .number({
        invalid_type_error: 'Selecionar uma marca.',
      })
      .optional()
      .nullable(),
    relationed_products: z
      .array(
        z.number({
          invalid_type_error: 'Selecionar um produto.',
        }),
      )
      .optional(),
    variations: z
      .array(
        z.number({
          invalid_type_error: 'Selecionar uma variação.',
        }),
      )
      .optional(),
    distribution_centers: z
      .array(
        z
          .number({
            invalid_type_error: 'Selecionar um centro de distribuição.',
          })
          .optional()
          .nullable(),
      )
      .optional(),

    schedulePublication: z.date().optional(),

    groupedProducts: z
      .array(
        z.object({
          product: z.number(),
          quantity: z.number().min(1),
        }),
      )
      .optional(),

    metaData: z.array(metaData),
  })
  .superRefine(async (data, ctx) => {
    if (
      data.productType &&
      data.productType === 'physical' &&
      (!data.dimension ||
        !data.dimension.width ||
        !data.dimension.height ||
        !data.dimension.weight ||
        !data.dimension.length)
    ) {
      const customError = {
        code: 'custom',
        message: 'As dimensões são obrigatórias para produtos físicos.',
      } as const;

      if (!data.dimension.width) {
        ctx.addIssue({
          ...customError,
          path: ['dimension.width'],
        });
      }

      if (!data.dimension.height) {
        ctx.addIssue({
          ...customError,
          path: ['dimension.height'],
        });
      }

      if (!data.dimension.weight) {
        ctx.addIssue({
          ...customError,
          path: ['dimension.weight'],
        });
      }

      if (!data.dimension.length) {
        ctx.addIssue({
          ...customError,
          path: ['dimension.length'],
        });
      }
    }

    if (data.id) {
      try {
        const isValid = await validateProductSlug(data.slug, data.id);

        if (!isValid) {
          throw new Error('O slug já está em uso.');
        }
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          message: 'O slug já está em uso.',
          path: ['slug'],
        });
      }
    }
  });
export type CreateOrEditProductSchemaProps = z.infer<
  typeof createOrEditProductSchema
>;
