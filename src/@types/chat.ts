
export interface IChat {
    id: number
    released: boolean
    createdAt: string
    updatedAt: string
    messages: {
        id: string | number;
        image?: string;
        author: string;
        message: string;
        firstName: string;
        exclusion: any
        type?: "system";
    }[]
    users: {
        id: number
        joinedAt: string
        blocked: boolean
        blockedAt: any
        isOnline: boolean
        chat_user: {
            id: number
            firstName: string
            lastName: string
            email: string
            socketId: string
            createdAt: string
            updatedAt: string
        }
    }[]
    //liveStream: ILiveStream
}