
export interface IBroadcaster {
    id: number
    name: string
    code: string;
    createdAt: string
    broadcaster_id: number
    updatedAt: string
    email: string
    avatar: {
        id: number;
        src: string;
        thumbnail: {
            src: string;
        };
    } | null;
    socialMedias: {
        id: 1;
        facebook: string | null;
        twitter: string | null;
        instagram: string | null;
        whatsapp: string | null;
        telegram: string | null;
    } | null;
}