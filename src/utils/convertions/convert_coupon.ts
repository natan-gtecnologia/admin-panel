import { ICoupon } from '../../@types/coupon';
import { IStrapiCoupon } from '../../@types/strapi';

export function convert_coupon_strapi(coupon: IStrapiCoupon): ICoupon {
  return {
    id: coupon.id,
    ...coupon.attributes,
  };
}
