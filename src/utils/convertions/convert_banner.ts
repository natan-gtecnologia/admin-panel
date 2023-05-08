import { IStrapiBanner } from '../../@types/strapi';
import { IBanner } from '../../@types/banner';

/**
 * It takes a Strapi tag and returns a tag
 * @param {IStrapiBanner} banner - IStrapiTag - this is the type of the parameter that
 * we're passing in.
 * @returns An object of type ITag
 */
export function convert_banner_strapi(tag: IStrapiBanner): IBanner {
  return {
    id: tag.id,
    title: tag.attributes.title,
    link_type: tag.attributes.link_type,
    order: tag.attributes.order,
    page: tag.attributes.page,
    page_link: tag.attributes.page_link,
    type: tag.attributes.type,
    desktop_image: tag.attributes.desktop_image,
    mobile_image: tag.attributes.mobile_image,
    category_link: tag.attributes.category_link,
    product_link: tag.attributes.product_link,
    createdAt: tag.attributes.createdAt,
    updatedAt: tag.attributes.updatedAt,
    publishedAt: tag.attributes.publishedAt,
  };
}
