import { IBroadcaster } from '@/@types/broadcasters';
import { IStrapiBroadcaster } from '../../@types/strapi';

export function convert_broadcasters_strapi(broadcaster: IStrapiBroadcaster): IBroadcaster {
  // console.log(
  //   "🚀 ~ file: convert_live_stream.ts ~ line 70 ~ convert_livestream_strapi ~ livestream",
  //   broadcaster
  // );
  return {
    avatar: broadcaster.attributes.avatar,
    id: broadcaster.id,
    createdAt: broadcaster.attributes.createdAt,
    metaData: broadcaster.attributes.metaData,
    name: broadcaster.attributes.name,
    updatedAt: broadcaster.attributes.updatedAt,
    email: broadcaster.attributes.email,
    socialMedias: broadcaster.attributes.socialMedias

  };
}
