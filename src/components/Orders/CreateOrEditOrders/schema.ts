import { validatePhone } from '@growth/core/util/formatting';
import { validateCPF } from 'apps/growforce/admin-panel/utils/validateCPF';
import { z } from 'zod';

export const itemsOrdersSchema = z.object({
    items: z
        .array(
            z.object({
                product: z.number(),
                quantity: z.number().min(1),
                activation_date: z.array(z.date()).optional().nullable(),
                method: z.string().default('add')
            }),
        ),
})
export type ItemsOrderSchemaProps = z.infer<typeof itemsOrdersSchema>;

export const identityOrderSchema = z.object({
    customerId: z.string().optional(),
    firstName: z
        .string()
        .min(3, 'Este campo é obrigatório')
        .refine((item) => String(item).trim().length > 0, 'Digite um valor válido'),
    lastName: z
        .string()
        .min(3, 'Este campo é obrigatório')
        .refine((item) => String(item).trim().length > 0, 'Digite um valor válido'),
    phone: z
        .string()
        .min(1, 'Este campo é obrigatório')
        .refine((a) => validatePhone(a), 'Este telefone é inválido'),
    cpf: z.string().refine((a) => validateCPF(a), 'Este CPF é inválido'),
    email: z.string().email('Este e-mail é inválido'),
    birthDate: z.string().min(10, 'Tamanho inválido, usar formato dd/mm/aaaa'),
    billingAddress: z
        .object({
            address1: z.string().min(1, 'Este campo é obrigatório'),
            address2: z.string().optional(),
            city: z.string().min(1, 'Este campo é obrigatório'),
            state: z.string().min(1, 'Este campo é obrigatório').max(6, 'Tamanho inválido, tente usar ES'),
            neighborhood: z.string().min(1, 'Este campo é obrigatório'),
            country: z.string().optional(),
            postCode: z.string().min(1, 'Este campo é obrigatório'),
            number: z.string().min(1, 'Este campo é obrigatório'),
        }),
})
export type IdentityOrderSchemaProps = z.infer<typeof identityOrderSchema>;

export const shippingOrderSchema = z.object({
    optionShipping: z.enum(['shipping', 'withdraw_now', 'esim']).default('withdraw_now'),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    neighborhood: z.string().optional(),
    country: z.string().optional(),
    state: z.string().max(6, 'Tamanho inválido, tente usar ES').optional(),
    postCode: z.string().optional(),
    number: z.string().optional(),
    shippingMethod: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.optionShipping === 'shipping') {
        if (data.address1?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['address1'],
            });
        }
        if (data.city?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['city'],
            });
        }
        if (data.neighborhood?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['neighborhood'],
            });
        }
        if (data.number?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['number'],
            });
        }
        if (data.postCode?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['postCode'],
            });
        }
        if (data.state?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['state'],
            });
        }
        if (data?.shippingMethod?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Selecione um métedo de envio',
                path: ['shippingMethod'],
            });
        }
    }
})
export type ShippingOrderSchemaProps = z.infer<typeof shippingOrderSchema>;

export const paymentOrderSchema = z.object({
    method: z.enum(['credit_card', 'pix']),
    creditCard: z
        .object({
            number: z.string(),
            name: z.string(),
            expiry: z.string(),
            cvc: z.string().max(4, 'Este campo deve ter no máximo 4 dígitos'),
            installments: z.number().default(1),
        })
        .optional(),
    // payment: z.object({
    // }),
}).superRefine((data, ctx) => {
    if (data.method === 'credit_card') {
        if (data.creditCard?.name?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['creditCard.name'],
            });
        }
        if (data.creditCard?.cvc?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['creditCard.cvc'],
            });
        }
        if (data.creditCard?.expiry?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['creditCard.expiry'],
            });
        }
        if (Number(data.creditCard.number) === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Este campo é obrigatório',
                path: ['creditCard.number'],
            });
        }
    }
})
export type PaymentOrderSchemaProps = z.infer<typeof paymentOrderSchema>;

export const ordersSchema = z.object({
    identity: identityOrderSchema,
    shippingAddress: shippingOrderSchema.optional(),
    payment: paymentOrderSchema,
    items: itemsOrdersSchema,
});

export type CreateOrUpdateOrdersSchemaProps = z.infer<typeof ordersSchema>;

