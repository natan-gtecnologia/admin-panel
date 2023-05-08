import { IDistributionCenter } from '../../@types/distribution-center';
import { IStrapiDistributionCenter } from '../../@types/strapi';

export function convert_distribution_center_strapi(
  dCenter: IStrapiDistributionCenter
): IDistributionCenter {
  return {
    id: dCenter.id,
    name: dCenter.attributes.name,
    phone: dCenter.attributes.phone,
    email: dCenter.attributes.email,
    createdAt: dCenter.attributes.createdAt,
    updatedAt: dCenter.attributes.updatedAt,
    cnpj: dCenter.attributes.cnpj,
    responsible: dCenter.attributes.responsible,
  };
}
