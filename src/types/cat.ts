export interface CatInfo {
    source?: string;
    chain?: string;
    nftType?: string;
    id: string;
    name: string;
    image: string;
    meta?: any;
    createAt: number;
    visibility: number;
    life: number


    RelatedUser: string
    status: number;
    updateTime: number;
    user: string;
}