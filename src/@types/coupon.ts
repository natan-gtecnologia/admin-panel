import { IStrapiCartProduct, IStrapiCategory, IStrapiProduct } from './strapi';

export interface ICoupon {
  id: number;
  code: string;
  description: string;
  discount: number;
  enabled: boolean;
  automatic: boolean;
  accumulative: boolean;
  firstShop: boolean;
  discountType: 'price' | 'percentage';
  type:
    | 'all_store'
    | 'specific_products'
    | 'specific_categories'
    | 'specific_customers'
    | 'free_shipping_by_region'
    | 'free_shipping_by_products'
    | 'buy_and_earn_by_products'
    | 'buy_and_earn_by_categories'
    | 'buy_and_earn_by_cart_price';
  initialDate?: string;
  finalDate?: string;
  shippingType: 'not_apply' | 'to_shipping' | 'free_shipping';
  shippingDiscountType: 'price' | 'percentage';
  maximumUseQuantity?: number;
  minimumPrice?: number;
  maximumPrice?: number;
  minimumProductQuantity?: number;
  initialCepRange?: string;
  finalCepRange?: string;
  minimumCartPrice?: number;
  accumulatedDiscountLimit?: number;
  shippingDiscount?: number;
  minimumCartAmount?: number;
  applicationType: 'all_store' | 'specific_products' | 'specific_products';
  buyAndEarnProducts?: {
    buyProducts?: IStrapiCartProduct;
    earnProducts?: IStrapiCartProduct;
  }[];
  categories?: IStrapiCategory[];
  products?: IStrapiProduct[];
  customers?: {
    attributes?: {
      email?: string;
    };
  }[];
}
