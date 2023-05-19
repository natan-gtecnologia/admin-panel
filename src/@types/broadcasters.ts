
export interface IBroadcaster {
    id: number
    name: string
    code: string;
    broadcaster_id: number
    createdAt: string
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
        id: number
        facebook: string | null;
        twitter: string | null;
        instagram: string | null;
        whatsapp: string | null;
        telegram: string | null;
    } | null;
    metaData: any[]
}