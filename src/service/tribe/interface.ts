import {GroupMsg, Message, MessageType, MsgTextImage, TribeInfo, TribeResult, TribeRole, TribeTheme} from "../../types";
import {ThemeColors} from "../../common/getMainColor";

export interface ITribe {

    // userLogin: (signRet: { r: string, s: string, v: string }) => Promise<string>
    //
    // userCheckAuth: () => Promise<string>
    //
    // userLogout: () => Promise<boolean>
    //
    // creatTribe: (tribeInfo: { title: string, desc: string, color: string, backgroundColor: string, image: MsgTextImage,themeTag:string,themeDesc:string }) => Promise<string>
    //
    // addRole: (tribeRole: TribeRole) => Promise<string>
    //
    // updateTribe: (theme: TribeTheme) => Promise<boolean>
    //
    // tribeRoles: (tribeId: string) => Promise<Array<TribeRole>>
    //
    // tribeInfo: (tribeId: string) => Promise<TribeInfo>
    //
    // summarizeTribe: (tribeId: string, msgIds: Array<string>) => Promise<boolean>
    //
    // groupedMsg: (groupIds: Array<string>) => Promise<Array<GroupMsg>>;
    //
    // groupIds: (tribeId: string) => Promise<Array<string>>;
    //
    // forkTribe: (tribeId: string, groupId: string,tribeInfo: TribeInfo) => Promise<string>;
    //
    // msgSupport: (msgId: string, bool: boolean) => Promise<boolean>
    //
    // pushTribe: (data: { tribeId: string, msgType: MessageType, role: string, content: string, replayToMsgId?: string }) => Promise<string>
    //
    // // picUpload: () => Promise<{ url: string, themeColors: ThemeColors }>;
    //
    // // getCacheMsg: (tribeId: string) => Promise<Array<Message>>;
    //
    // // setCacheMsg: (tribeId: string, msgs: Array<Message>) => Promise<void>;
    //
    // updateMsg : (msgId: string,content: string) => Promise<string>;
    //
    // deleteMsg: (msgId: string) => Promise<string>

}

