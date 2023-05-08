import { IOrder } from '../../@types/order';
import { IStrapiOrder } from '../../@types/strapi';

export function convert_order_strapi(order: IStrapiOrder): IOrder {
  return {
    id: order.id,
    orderId: order.attributes.orderId,
    items: order.attributes.items,
    createdAt: order.attributes.createdAt,
    payment: order.attributes.payment,
    status: order.attributes.status,
    totals: order.attributes.totals,
    customer: {
      id: order.attributes.customer?.data?.id ?? 0,
      email:
        order.attributes.customer?.data?.attributes?.email ??
        'nao@informado.com.br',
      document:
        order.attributes.customer?.data?.attributes?.document ??
        '000.000.000-00',
      documentType:
        order.attributes.customer?.data?.attributes?.documentType ?? 'cpf',
      createdAt: order.attributes.customer?.data?.attributes?.createdAt ?? '',
      updatedAt: order.attributes.customer?.data?.attributes?.updatedAt ?? '',
      firstName:
        order.attributes.customer?.data?.attributes?.firstName ?? 'Não',
      lastName:
        order.attributes.customer?.data?.attributes?.lastName ??
        'Informado Junior',
      homePhone: order.attributes.customer?.data?.attributes?.homePhone ?? {
        countryCode: '00',
        areaCode: '00',
        number: '000000000',
      },
      mobilePhone: order.attributes.customer?.data?.attributes?.mobilePhone ?? {
        countryCode: '00',
        areaCode: '00',
        number: '000000000',
      },
    },
    billingAddress: order.attributes.billingAddress,
    shippingAddress: order.attributes.shippingAddress,
    coupons: order.attributes.coupons,
    shipping: order.attributes.shipping,

    paymentId:
      order.attributes.metaData.find((meta) => meta.key === 'paymentId')
        ?.valueString ?? '',
    comission:
      order.attributes.metaData.find((meta) => meta.key === 'comission')
        ?.valueFloat ?? '',
    erpNumber:
      order.attributes.metaData.find((meta) => meta.key === 'erpNumber')
        ?.valueString ?? '',
    erpOrderId:
      order.attributes.metaData.find((meta) => meta.key === 'erpOrderId')
        ?.valueString ?? '',
  };
}
