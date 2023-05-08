import { IChat } from "../../@types/chat";
import { IStrapiChat } from "../../@types/strapi";
import { convert_livestream_strapi } from "./convert_live_stream";

export function convert_chat_strapi(
    chat: IStrapiChat
): IChat {
    return {
        id: chat.id,
        createdAt: chat.attributes.createdAt,
        messages: chat.attributes?.messages?.data?.map(message => ({
            id: message.id,
            firstName: message.attributes?.author?.data?.attributes?.firstName ?? '',
            author: message.attributes?.author?.data?.attributes?.firstName ?? '',
            exclusion: message.attributes.exclusion,
            message: message.attributes.message,
        })) ?? [],
        released: chat.attributes?.released ?? false,
        updatedAt: chat.attributes.updatedAt,
        users: chat.attributes?.users?.map(user => ({
            id: user.id,
            chat_user: user.chat_user,
            blocked: user.blocked,
            blockedAt: user.blockedAt,
            isOnline: user.isOnline,
            joinedAt: user.joinedAt,
        })) ?? []
        //liveStream: convert_livestream_strapi(chat.attributes.liveStream.data),
    }
}