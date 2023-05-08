import { IStrapiCategory, IStrapiImage, IStrapiProduct } from "./strapi";

export interface IBanner {
  id: number;
  title: string;
  page_link: string;
  page: 'homepage' | 'products' | 'product';
  order: number;
  type: 'hero' | 'section';
  link_type: "product" | "page" | "category";
  desktop_image?: {
    data: IStrapiImage;
  };
  mobile_image?: {
    data: IStrapiImage;
  };
  category_link?: {
    data: IStrapiCategory;
  };
  product_link?: {
    data: IStrapiProduct;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
