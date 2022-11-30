import {ImageType, TribeRole, TribeTheme} from "./tribe";
import {Factor} from "@emit-technology/emit-lib";

export enum MessageType {
    Dice = 'dice',
    Role = 'role',
    Text = 'text',
    Expression = 'expression',
    Theme = 'theme',
    Airdrop = 'airdrop',
    Support = 'support',

    Divide = 'divide',

    UpdateTribe = 'updateTribe',
    Pin = 'pin'
}

export enum MessageStatus {

    dashed,
    draft = 1,
    pinned = 2,
    removed=3,
}
export enum AirdropType {
    Random = 'random',
    Average = 'average'
}

export interface Tribe {
    id: string;
    color: string;
    backgroundColor: string;
    image: ImageType;
    title: string;
    desc: string;

    forkedTribeId?: string;
}

export interface Message {
    msgIndex?:number;
    id: string;
    tribeId: string
    owner: string;
    timestamp: number;
    content: Dice | TribeRole | MsgText | Expression | TribeTheme | AirdropContent | Support;
    replayToMsgId?: string;

    groupId: string;
    msgStatus: MessageStatus;
    role: string;
    seq: number;
    support: number;
    msgType: MessageType

    actor?: TribeRole
    theme?: TribeTheme
    replayMsg?: Message;

    Supporters?: Array<string>

    hideTime?:any
}

export interface Support {
    tribeId: string;
    msgId: string;
    support: boolean;
    timestamp: number
}

export interface Dice {
    id: string;
    role: TribeRole;
    max: number;
}

export interface MsgText  {
    content?: string;
    image?: MsgTextImage;
    emoji?: any
}

export interface MsgTextImage {
    url: string;
    width: number;
    height: number;
}

export interface Expression {
    title: string;
    image: ImageType;
    content: string;
}

// export interface TribeTheme {
//     image: string;
//     color: string;
//     backgroundColor: string;
// }

export interface AirdropContent {
    title: string;
    max: number;
    // amount: string;
    factor: Factor;
    content: string;
    airdropType: AirdropType;
}

export interface PinnedSticky {
    theme: TribeTheme;
    seq: number;
    roles: Array<TribeRole>;
    records: Array<Message>;
    groupId: string;
    index: number

    showPin?:{lastPin: PinnedSticky, showPin: boolean, showFork: boolean};
}

export enum WsStatus {
    _,
    inactive,
    active,
    tokenInvalid,
}