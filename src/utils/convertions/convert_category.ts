import { ICategory } from '../../@types/category';
import { IStrapiCategory } from '../../@types/strapi';
/**
 * It takes a Strapi tag and returns a tag
 * @param {IStrapiTag} category - IStrapiTag - this is the type of the parameter that
 * we're passing in.
 * @returns An object of type ITag
 */
export function convert_category_strapi(category: IStrapiCategory): ICategory {
  return {
    id: category.id,
    title: category.attributes.title,
    description: category.attributes.description,
    metaData: category.attributes.metaData,
    slug: category.attributes.slug,
    createdAt: category.attributes.createdAt,
    updatedAt: category.attributes.updatedAt,
    publishedAt: category.attributes.publishedAt
  };
}
