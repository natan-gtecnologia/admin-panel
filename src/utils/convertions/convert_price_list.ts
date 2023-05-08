import { IPriceList } from '../../@types/priceList';
import { IStrapiPriceList } from '../../@types/strapi';

export const convert_price_list_strapi = (
  priceList: IStrapiPriceList,
): IPriceList => {
  return {
    id: priceList.id,
    name: priceList.attributes.name,
    company: priceList.attributes?.company?.data?.id ?? null,
    productPrices:
      priceList.attributes?.productPrices?.map((productPrice) => ({
        product: {
          id: productPrice.product.data.id,
          title: productPrice.product.data.attributes.title,
        },
        price: {
          regularPrice: productPrice.price.regularPrice,
          salePrice: productPrice.price.salePrice,
        },
      })) ?? [],
    enabled: priceList.attributes.enabled ?? false,
    createdAt: priceList.attributes.createdAt,
    updatedAt: priceList.attributes.updatedAt,
  };
};
