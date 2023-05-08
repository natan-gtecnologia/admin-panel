import { ICustomers } from '../../@types/customers';
import { IStrapiCustomer } from '../../@types/strapi';

/**
 * It takes a Strapi tag and returns a tag
 * @param {IStrapiCustomer} customer - IStrapiTag - this is the type of the parameter that
 * we're passing in.
 * @returns An object of type ITag
 */
export function convert_customer_strapi(customer: IStrapiCustomer): ICustomers {
  return {
    id: customer.id,
    document: customer.attributes.document,
    documentType: customer.attributes.documentType,
    createdAt: customer.attributes.createdAt,
    email: customer.attributes.email,
    firstName: customer.attributes.firstName,
    lastName: customer.attributes.lastName,
    birthDate: customer.attributes?.birthDate,
    updatedAt: customer.attributes.updatedAt,
    mobilePhone: {
      number: customer?.attributes.mobilePhone.areaCode + customer?.attributes.mobilePhone.number
    },
    address: {
      id: customer.attributes?.address?.id ?? 0,
      address1: customer.attributes?.address?.address1 ?? '',
      address2: customer.attributes?.address?.address2 ?? '',
      city: customer.attributes?.address?.city ?? '',
      country: customer.attributes?.address?.country ?? '',
      postCode: customer.attributes?.address?.postCode ?? '',
      number: customer.attributes?.address?.number ?? '',
      neighborhood: customer.attributes?.address?.neighborhood ?? '',
      state: customer.attributes?.address?.state ?? '',
    },
    orders: customer.attributes?.orders?.data ?? [],
    carts: customer.attributes.carts.data ?? [],
  };
}
