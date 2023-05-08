import { ICompany } from '../../@types/company';
import { IStrapiCompany } from '../../@types/strapi';
import { convert_price_list_strapi } from './convert_price_list';

export function convert_company_strapi(company: IStrapiCompany): ICompany {
  return {
    id: company.id,
    name: company.attributes.name,
    cnpj: company.attributes.cnpj,
    phone: company.attributes.phone || '',
    email: company.attributes.email,
    address: company.attributes?.address || null,
    company: company.attributes?.company?.data
      ? convert_company_strapi(company.attributes.company?.data)
      : null,
    priceList: company.attributes?.priceList?.data
      ? convert_price_list_strapi(company.attributes.priceList.data)
      : null,
    nodeId: company.attributes?.nodeId || '',

    createdAt: company.attributes.createdAt,
    updatedAt: company.attributes.updatedAt,
    metaData: company.attributes.metaData,
  };
}
