import {AirdropType, Message, MsgTextImage} from "./message";

export type ImageType = MsgTextImage | string;

export interface TribeResult<T> {
    code: number
    data: T;
    message: string;
}

export interface TribeRole {
    id?: string;
    avatar: ImageType;
    name: string;
    createdBy?: string;
    createdAt?: number;
    desc?: string;
    tribeId?: string;
    op?: string
    origin?: TribeRole
}

export interface TribeInfo {
    tribeId: string;
    keeper: string
    lastPinedSeq: number
    onlineUser: number
    theme: TribeTheme
    title: string;
    desc: string;
    forked?: Array<any>

    themeTag: string;
    themeDesc: string;

    roles?: Array<TribeRole>
    latestMsg?: Message
    subscribed?:boolean
    likes?:number;
    reads?:number;
    collections?:number;
}

export interface TribeTheme {
    tribeId?: string;
    color: string;
    backgroundColor: string;
    image: ImageType;

    themeTag: string;
    themeDesc: string;

    title?: string;
    desc?: string
}

export interface GroupMsg {
    records: Array<Message>;
    roles: Array<TribeRole>;
    theme: TribeTheme;
    groupId?: string
}

export interface UserLimit {
    maxMsgCount: number;
    maxSupportCount: number;
    msgLeft: number;
    supportLeft: number;
}

export interface FunctionReq {
    tribeId: string
    role: string
    title: string
    max: string
    content: string
    airdropType: AirdropType
}

export interface AirdropInfo {
    id: string;
    user: string;
    groupId: string;
    apportionId: string;
    amount: string;
    txHash: string;
}

export interface MsgStaticInfo {
    tribeId: string;
    groupId: string;
    messages: number;
    reads: number;
    retweets: number;
    likes: number;
    seq: number
}


export interface StreamMsg {
    records: Array<Message>;
    total: number;
}