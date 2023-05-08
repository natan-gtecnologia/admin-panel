import { IStrapiTag } from '../../@types/strapi';
import { ITag } from '../../@types/tag';

/**
 * It takes a Strapi tag and returns a tag
 * @param {IStrapiTag} tag - IStrapiTag - this is the type of the parameter that
 * we're passing in.
 * @returns An object of type ITag
 */
export function convert_tag_strapi(tag: IStrapiTag): ITag {
  return {
    id: tag.id,
    tag: tag.attributes.tag,
    color: tag.attributes.color,
    metaData: tag.attributes.metaData,
    createdAt: tag.attributes.createdAt,
    updatedAt: tag.attributes.updatedAt,
  };
}
