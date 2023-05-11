import { ICoupon } from "./coupon";
import { IProduct } from "./product";
import { MetaData } from "./strapi";

export interface ILiveStream {
  id: number;
  state: "enabled" | "disabled" | "testing" | "finished";
  uuid: string;
  title: string;
  liveEventName?: string;
  streamKey: string;
  transmissionUrl: string;
  endedDate: string | null;
  liveDescription: string;
  schedule: string;
  startedDate?: string | null;
  timeout?: number | null;
  startText: string;
  backgroundColorIfNotHaveBanner: string;
  broadcasters: {
    code: string;
    broadcaster_id: number;
    id: number | null;
    name: string | null;
    email: string | null;
    avatar: {
      id: number;
      src: string;
      thumbnail: {
        src: string;
      };
    } | null;
    socialMedias: {
      id: 1;
      facebook: string | null;
      twitter: string | null;
      instagram: string | null;
      whatsapp: string | null;
      telegram: string | null;
    } | null;
  }[];
  coupons: ICoupon[];
  streamProducts: {
    product: IProduct;
    price: {
      regularPrice: number;
      salePrice: number;
    };
    highlight: boolean;
  }[];
  chat: {
    id: number;
    active?: boolean;
  };
  metaData: MetaData[];
  bannerLive: {
    id: number;
    src: string;
    thumbnail: {
      src: string;
    };
  } | null;
}
