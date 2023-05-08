import { IBrand } from '../../@types/brand';
import { IStrapiBrand } from '../../@types/strapi';

export function convert_brand_strapi(brand: IStrapiBrand): IBrand {
  return {
    id: brand.id,
    name: brand.attributes.name,
    createdAt: brand.attributes.createdAt,
  };
}
