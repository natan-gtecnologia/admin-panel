import { ILiveStream } from "../../@types/livestream";
import { IStrapiLiveStream } from "../../@types/strapi";
import { convert_coupon_strapi } from "./convert_coupon";
import { convert_image_strapi } from "./convert_image";
import { convert_product_strapi } from "./convert_product";

export function convert_livestream_strapi(
  livestream: IStrapiLiveStream
): ILiveStream {
  return {
    id: livestream.id,
    uuid: livestream.attributes.uuid,
    state: livestream.attributes?.state,
    title: livestream.attributes?.title,
    liveEventName: livestream.attributes?.liveEventName,
    endedDate: livestream.attributes?.endedDate,
    streamProducts: livestream.attributes?.streamProducts.map(
      ({ product, price, highlight }) => {
        return {
          highlight,
          price,
          product: convert_product_strapi(product.data),
        };
      }
    ),
    coupons:
      livestream.attributes.coupons?.data?.map(convert_coupon_strapi) ?? [],
    schedule: livestream.attributes.schedule,
    streamKey: livestream.attributes.streamKey,
    transmissionUrl: livestream.attributes.transmissionUrl,
    timeout: livestream.attributes.timeout,
    startedDate: livestream.attributes.startedDate,

    broadcasters:
      livestream.attributes?.broadcasters?.data.map((broadcaster) => ({
        id: broadcaster.id,
        name: broadcaster.attributes.name,
        socialMedias: broadcaster.attributes.socialMedias,
        avatar: convert_image_strapi(broadcaster.attributes.avatar.data),
      })) ?? [],

    chat: {
      id: livestream.attributes?.chat?.data?.id,
      released: livestream.attributes?.chat?.data?.attributes.released,
    },

    metaData: livestream.attributes.metaData,
  };
}
