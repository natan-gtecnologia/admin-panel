import { z } from 'zod';

//const schema = z.lazy(() =>
//  z.object({
//    // Allow any additional properties with dynamic values
//    // Use `z.any()` to allow any value type
//    // Use `z.lazy()` to allow nested objects with dynamic properties
//    [z.string()]: z.lazy(() => z.any()),
//  }),
//);

export const metaData = z.object({
  key: z
    .string()
    .min(1, 'A chave deve conter no mínimo 1 caracter.')
    .max(100, 'A chave deve conter no máximo 100 caracteres.'),
  valueString: z.string().optional(),
  valueInteger: z.number().optional().default(0),
  valueBigInteger: z.number().optional(),
  valueDecimal: z.number().optional(),
  valueFloat: z.number().optional(),
  valueBoolean: z
    .any()
    .nullable()
    .optional()
    .transform((value) => {
      if (value === 'true' || value === true) {
        return true;
      }
      if (value === 'false' || value === false) {
        return false;
      }
      return null;
    }),
  valueJson: z
    .any()
    .optional()
    .superRefine((value, ctx) => {
      if (!value) return value;

      if (typeof value === 'string') {
        ctx.addIssue({
          code: 'custom',
          message: 'O valor deve ser um objeto JSON válido.',
        });
      }
    }),
});
