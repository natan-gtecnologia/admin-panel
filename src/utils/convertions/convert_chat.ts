import { IChat } from "../../@types/chat";
import { IStrapiChat } from "../../@types/strapi";

export function convert_chat_strapi(chat: IStrapiChat): IChat {
  return {
    id: chat.id,
    createdAt: chat.attributes.createdAt,
    messages:
      chat.attributes?.messages?.data?.map((message) => ({
        id: message.id,
        firstName:
          message.attributes?.author?.data?.attributes?.firstName ?? "",
        author: message.attributes?.author?.data?.attributes?.firstName ?? "",
        exclusion: message.attributes.exclusion,
        message: message.attributes.message,
      })) ?? [],
    released: chat.attributes?.released ?? false,
    updatedAt: chat.attributes.updatedAt,
    users: chat.attributes?.users?.map(user => ({
      id: user.id,
      blocked: user.blocked,
      blockedAt: user.blockedAt,
      chat_user: {
        id: user.chat_user?.id ?? 0,
        email: user.chat_user.attributes?.email ?? '',
        firstName: user.chat_user.attributes?.firstName ?? '',
        lastName: user.chat_user.attributes?.lastName ?? '',
        socketId: user.chat_user.attributes?.socketId ?? '',
        createdAt: user.chat_user.attributes?.createdAt ?? '',
        updatedAt: user.chat_user.attributes?.updatedAt ?? ''
      },
      isOnline: user.isOnline,
      joinedAt: user.joinedAt,
    })) ?? []
    //liveStream: convert_livestream_strapi(chat.attributes.liveStream.data),
  };
}
