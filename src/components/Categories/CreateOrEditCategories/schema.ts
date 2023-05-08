import { z } from 'zod';
import { metaData } from '../../../utils/metaData';
import { validateSlug } from './slugValidationCategory';

export const CategoriesSchema = z
  .object({
    id: z.number().nullable(),
    title: z
      .string()
      .min(1, 'O título deve ter no mínimo 1 caracter')
      .transform((value) => value.trim()),
    slug: z
      .string()
      .min(1, 'O slug deve ter no mínimo 1 caracter')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'O slug deve conter apenas letras minúsculas e números.',
      ),
    description: z
      .string()
      .optional()
      .default('')
      .nullable()
      .transform((value) => {
        return value ? value.replace(/(&nbsp; ?){2,}/gm, '') : value;
      }),
    metaData: z.array(metaData).optional().default([]),
  })
  .superRefine(async (data, ctx) => {
    if (data.id) {
      try {
        const isValid = await validateSlug(data.slug, data.id);

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

export type CreateOrUpdateCategoriesSchemaProps = z.infer<
  typeof CategoriesSchema
>;
