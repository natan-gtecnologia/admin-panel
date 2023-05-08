import { IProduct } from '../../@types/product';
import { IStrapiProduct } from '../../@types/strapi';

export function convert_product_strapi(product: IStrapiProduct): IProduct {
  return {
    id: product.id,
    ...product.attributes,
  };
}
