import { ILiveStream } from "../../@types/livestream";
import { IStrapiLiveStream } from "../../@types/strapi";
import { convert_coupon_strapi } from "./convert_coupon";
import { convert_image_strapi } from "./convert_image";
import { convert_product_strapi } from "./convert_product";

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
        ({ product, price, highlight }) => {
          return {
            highlight,
            price,
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
    timeout: livestream.attributes?.timeout,
    startedDate: livestream.attributes?.startedDate ?? null,

    broadcasters: livestream.attributes?.broadcasters?.map((broadcaster) => ({
      broadcaster_id: broadcaster.id,
      id: broadcaster?.broadcaster?.data?.id ?? null,
      name: broadcaster?.broadcaster?.data?.attributes?.name ?? null,
      socialMedias:
        broadcaster?.broadcaster?.data?.attributes?.socialMedias ?? null,
      avatar: broadcaster?.broadcaster?.data?.attributes?.avatar?.data
        ? convert_image_strapi(
          broadcaster?.broadcaster?.data.attributes.avatar.data
        )
        : null,
    })) ?? [],
    chat: {
      id: livestream.attributes?.chat?.data?.id ?? null,
      active: livestream.attributes?.chat?.data?.attributes?.active ?? null,
    },

    metaData: livestream.attributes?.metaData,
    bannerLive: livestream.attributes?.bannerLive?.data ? convert_image_strapi(livestream.attributes?.bannerLive?.data) : null,
  };
}