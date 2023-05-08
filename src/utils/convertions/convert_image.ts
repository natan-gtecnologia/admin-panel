import { IStrapiImage } from "@/@types/strapi";

export function convert_image_strapi(img: IStrapiImage) {
  const imageSrc = `${img?.attributes?.hash}${img?.attributes?.ext}`;
  const thumbnailImageSrc = `${img?.attributes?.formats?.small?.hash}${img?.attributes?.formats?.small?.ext}`;

  return {
    id: img?.id,
    src: `${process.env["NEXT_PUBLIC_IMAGE_CACHE"]}/${imageSrc}`,
    thumbnail: {
      src: `${process.env["NEXT_PUBLIC_IMAGE_CACHE"]}/${thumbnailImageSrc}`,
    },
  };
}
