import { z } from 'zod';
import { metaData } from '../../../utils/metaData';
import { validateCNPJ } from '../../../utils/validateCNPJ';
import { validateCPF } from '../../../utils/validateCPF';

export const customerSchema = z
  .object({
    firstName: z.string().min(1, 'Este campo é obrigatório').max(50),
    lastName: z.string().min(1, 'Este campo é obrigatório').max(50),
    documentType: z.enum(['cpf', 'passport', 'cnpj']).default('cpf'),
    cnpj: z.string(),
    passport: z.string(),
    cpf: z.string(),
    document: z.string(),
    birthDate: z.date().optional(),
    email: z.string().email('E-mail inválido'),
    mobilePhone: z.object({
      number: z.string(),
    }),
    address: z.object({
      address1: z.string().min(1, 'Este campo é obrigatório'),
      address2: z.string().optional(),
      number: z.string().optional(),
      postCode: z.string().min(1, 'Este campo é obrigatório').max(9),
      state: z.string().min(1, 'Este campo é obrigatório'),
      city: z.string().min(1, 'Este campo é obrigatório'),
      country: z.string().min(1, 'Este campo é obrigatório'),
      neighborhood: z.string().min(1, 'Este campo é obrigatório'),
    }),
    metaData: z.array(metaData).optional().default([]),
    orders: z.array(z.number()).optional().default([]),
    carts: z.array(z.number()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (
      data.documentType === 'cpf' &&
      (data.cpf.length < 1 || data.cpf.length === 0)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Este campo é obrigatório',
        path: ['cpf'],
      });
    }

    if (data.documentType === 'cpf' && !validateCPF(data.cpf)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Este CPF é inválido',
        path: ['cpf'],
      });
    }

    if (data.documentType === 'cnpj' && data.cnpj.length < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Este campo é obrigatório',
        path: ['cnpj'],
      });
    }

    if (data.documentType === 'cnpj' && !validateCNPJ(data.cnpj)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Este CNPJ é inválido',
        path: ['cnpj'],
      });
    }

    if (data.documentType === 'passport' && data.passport.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Este campo é obrigatório',
        path: ['passport'],
      });
    }
  });

export type CreateOrUpdateCustomersSchemaProps = z.infer<typeof customerSchema>;
