import { IBroadcaster } from '@/@types/broadcasters';
import { IStrapiBroadcaster } from '../../@types/strapi';
import { convert_image_strapi } from './convert_image';

export function convert_broadcasters_strapi(broadcaster: IStrapiBroadcaster): IBroadcaster {
  // console.log(
  //   "🚀 ~ file: convert_live_stream.ts ~ line 70 ~ convert_livestream_strapi ~ livestream",
  //   broadcaster
  // );
  return {
    code: '',
    broadcaster_id: 0,
    avatar: broadcaster.attributes.avatar?.data ? convert_image_strapi(broadcaster.attributes.avatar.data) : null,
    id: broadcaster.id,
    createdAt: broadcaster.attributes.createdAt,
    metaData: broadcaster.attributes.metaData,
    name: broadcaster.attributes.name,
    updatedAt: broadcaster.attributes.updatedAt,
    email: broadcaster.attributes?.email ?? '',
    socialMedias: {
      facebook: broadcaster.attributes?.socialMedias?.facebook ?? '',
      id: broadcaster.attributes?.socialMedias?.id ?? 0,
      instagram: broadcaster.attributes?.socialMedias?.instagram ?? '',
      telegram: broadcaster.attributes?.socialMedias?.telegram ?? '',
      twitter: broadcaster.attributes?.socialMedias?.twitter ?? '',
      whatsapp: broadcaster.attributes?.socialMedias?.whatsapp ?? '',
    }

  };
}
