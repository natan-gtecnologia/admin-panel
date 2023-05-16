import { convert_product_strapi } from "@growthventure/utils/lib/formatting/convertions/convert_product";
import { ILiveStream } from "../../@types/livestream";
import { IStrapiLiveStream } from "../../@types/strapi";
import { convert_coupon_strapi } from "./convert_coupon";
import { convert_image_strapi } from "./convert_image";

export function convert_livestream_strapi(
  livestream: IStrapiLiveStream
): ILiveStream {
  // console.log(
  //   "🚀 ~ file: convert_live_stream.ts ~ line 70 ~ convert_livestream_strapi ~ livestream",
  //   livestream
  // );
  return {
    id: livestream.id,
    uuid: livestream.attributes.uuid,
    state: livestream.attributes?.state,
    title: livestream.attributes?.title,
    liveDescription: livestream.attributes?.liveDescription,
    liveEventName: livestream.attributes?.liveEventName,
    endedDate: livestream.attributes?.endedDate,
    startText: livestream.attributes?.startText ?? "",
    streamProducts:
      livestream.attributes?.streamProducts?.map(
        ({ product, price, highlight, id, metaData }) => {
          return {
            id,
            highlight,
            price,
            metaData,
            product: convert_product_strapi(product.data),
          };
        }
      ) ?? null,
    backgroundColorIfNotHaveBanner:
      livestream.attributes?.backgroundColorIfNotHaveBanner ?? "#DB7D72",
    coupons:
      livestream.attributes.coupons?.data?.map(convert_coupon_strapi) ?? [],
    schedule: livestream.attributes?.schedule,
    streamKey: livestream.attributes?.streamKey,
    transmissionUrl: livestream.attributes?.transmissionUrl,
    timeout: livestream.attributes?.timeout || 0,
    startedDate: livestream.attributes?.startedDate ?? null,

    broadcasters:
      livestream.attributes?.broadcasters?.map((broadcaster) => ({
        broadcaster_id: broadcaster.id,
        id: broadcaster?.broadcaster?.data?.id ?? null,
        name: broadcaster?.broadcaster?.data?.attributes?.name ?? null,
        email: broadcaster?.broadcaster?.data?.attributes?.email ?? null,
        socialMedias:
          broadcaster?.broadcaster?.data?.attributes?.socialMedias ?? null,
        avatar: broadcaster?.broadcaster?.data?.attributes?.avatar?.data
          ? convert_image_strapi(
            broadcaster?.broadcaster?.data.attributes.avatar.data
          )
          : null,
        code: broadcaster.code,
      })) ?? [],
    chat: {
      id: livestream.attributes?.chat?.data?.id || 0,
      active: livestream.attributes?.chat?.data?.attributes?.active || false,
    },

    metaData: livestream.attributes?.metaData,
    bannerLive: livestream.attributes?.bannerLive?.data
      ? convert_image_strapi(livestream.attributes?.bannerLive?.data)
      : null,
  };
}
