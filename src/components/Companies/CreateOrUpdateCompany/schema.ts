import { z } from 'zod';
import { validateCNPJ } from '../../../utils/validateCNPJ';

export const companySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'O nome da empresa deve ter pelo menos 1 caracter'),
  cnpj: z
    .string()
    .min(1, 'O CNPJ da empresa deve ter pelo menos 1 caracter')
    .refine((value) => validateCNPJ(value)),
  phone: z.string().nullable(),
  email: z
    .string()
    .email('O email da empresa deve ser válido')
    .min(1, 'O email da empresa deve ter pelo menos 1 caracter'),
  address: z
    .object({
      postCode: z.string({
        required_error: 'Campo obrigatório',
      }),
      address1: z.string({
        required_error: 'Campo obrigatório',
      }),
      number: z.string({
        required_error: 'Campo obrigatório',
      }),
      address2: z.string().optional(),
      neighborhood: z.string({
        required_error: 'Campo obrigatório',
      }),
      city: z.string({
        required_error: 'Campo obrigatório',
      }),
      state: z.string({
        required_error: 'Campo obrigatório',
      }),
      country: z.string({
        required_error: 'Campo obrigatório',
      }),
    })
    .optional(),
  company: z.number().optional().nullable(),
  priceList: z.number().optional().nullable(),

  nodeId: z.string().optional(),
});

export type CreateOrUpdateCompanySchema = z.infer<typeof companySchema>;
