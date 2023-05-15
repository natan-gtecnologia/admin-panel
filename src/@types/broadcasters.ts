export interface IBroadcaster {
    id: number
    name: string
    createdAt: string
    updatedAt: string
    email?: string
    avatar: {
        id: number
        name: string
        alternativeText: any
        caption: any
        width: number
        height: number
        formats?: {
            thumbnail: {
                name: string
                hash: string
                ext: string
                mime: string
                path: any
                width: number
                height: number
                size: number
                url: string
            }
        }
        hash: string
        ext: string
        mime: string
        size: number
        url: string
        previewUrl: any
        provider: string
        provider_metadata: any
        createdAt: string
        updatedAt: string
    }
    socialMedias?: {
        id: number
        facebook: any
        twitter: any
        instagram: any
        whatsapp: any
        telegram: any
        email: any
        telefone: any
    }
    metaData: any[]
}