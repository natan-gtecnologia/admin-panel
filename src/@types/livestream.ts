import { ICoupon } from "./coupon";
import { IProduct } from "./product";
import { IStrapiImage, MetaData } from "./strapi";

export interface ILiveStream {
    id: number;
    state: "enabled" | "disabled";
    uuid: string;
    streamKey: string;
    transmissionUrl: string;
    endedDate: string | null;
    schedule: string;
    startedDate?: string;
    timeout?: number | null;
    broadcasters: {
        id: number;
        name: string;
        avatar: {
            id: number;
            src: string;
            thumbnail: {
                src: string;
            };
        };
        socialMedias: {
            id: 1;
            facebook: string | null;
            twitter: string | null;
            instagram: string | null;
            whatsapp: string | null;
            telegram: string | null;
        };
    }[];
    coupons: ICoupon[];
    streamProducts: {
        product: IProduct
        price: {
            regularPrice: number;
            salePrice: number;
        };
        highlight: boolean;
    }[];
    chat: {
        id: number;
        released: boolean;
    };
    metaData: MetaData[];

}