import {Message, MsgTextImage} from "./message";

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
}

export interface UserLimit{
    msgLeft: number;
    supportLeft: number;
}