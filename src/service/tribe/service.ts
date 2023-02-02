import {ITribe} from "./interface";
import {
    AirdropInfo,
    GroupMsg,
    ImageType,
    Message,
    MessageStatus,
    MessageType,
    MsgStaticInfo,
    MsgText,
    PinnedSticky,
    StreamMsg,
    TribeInfo,
    TribeResult,
    TribeRole,
    TribeTheme,
    UserLimit
} from "../../types";
import {BaseRpc} from "../../rpc";
import config from "../../common/config";
import {Websocket, WebsocketBuilder} from 'websocket-ts';
import selfStorage from "../../common/storage";
import getMainColor, {ThemeColors} from "../../common/getMainColor";
import {emitBoxSdk} from "../emitBox";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import tribeWorker from "../../worker/imWorker";
import {utils} from "../../common";
import {App} from "@capacitor/app";
import walletWorker from "../../worker/walletWorker";
import {Device} from "@capacitor/device";
import {Photo} from "@capacitor/camera";
import {CatInfo} from "../../types/cat";
// import WebSocket from 'ws';

const W3CWebSocket = require('websocket').w3cwebsocket;
// const ws = require('ws');

const mutexify = require('mutexify/promise')

class TribeService implements ITribe {

    private _rpc: BaseRpc;
    private _ws: Websocket;
    private _wsOrigin: WebSocket;
    private _wsW3C: any;
    private _picRpc: BaseRpc;
    private _wsIntervalId: any;

    private _lock: any;

    private _groupMap: Array<GroupMsg>
    private _groupIds: Array<string>;
    private _groupStatic: { total: number, groupNum: Array<{ groupId: string, num: number }> };
    private _cacheMsg: Map<string, Message>;
    private _tribeInfo: TribeInfo = null;
    private _tribeRole: Array<TribeRole> = [];

    constructor() {
        this._rpc = new BaseRpc(config.tribeNode);
        this._picRpc = new BaseRpc(config.tribePic);
        this._lock = mutexify()
        this._groupMap = [];
        this._groupIds = [];
        this._groupStatic = {total: 0, groupNum: []}
        this._cacheMsg = new Map<string, Message>();
    }

    public getGroupMap = () => {
        return this._groupMap;
    }

    public getGroupIds = () => {
        if (this._groupIds.length == 0) {
            tribeService.groupIds(config.tribeId);
        }
        return this._groupIds;
    }

    public getGroupStatic = () => {
        return this._groupStatic;
    }

    init = async () => {
        const groupIds = await tribeService.groupIds(config.tribeId);
        await tribeService.groupedInfos(config.tribeId);
        await tribeService.groupedMsgInit(groupIds)
    }

    checkWorkerIsAlive = async () => {
        return await tribeWorker.checkAlive(config.tribeId);
    }

    addRole = async (tribeRole: TribeRole): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post(tribeRole && tribeRole.id ? '/tribe/updateRole' : '/tribe/addRole', tribeRole);
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    creatTribe = async (tribeInfo: { title: string, desc: string, color: string, backgroundColor: string, image: ImageType, themeTag: string, themeDesc: string }): Promise<string> => {
        await this.userCheckAuth()
        // tribeInfo["themeTag"] = tribeInfo.title;
        // tribeInfo["themeDesc"] = tribeInfo.desc;
        const rest: TribeResult<string> = await this._rpc.post('/tribe/creatTribe', tribeInfo);
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    msgSupport = async (msgId: string, bool: boolean): Promise<boolean> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/tribe/msgSupport', {msgId: msgId, support: bool});
        if (rest && rest.code == 0) {
            return Promise.resolve(true)
        }
        return Promise.reject(rest.message);
    }

    selectedTribeMsg = async (tribeId: string, skip: number, limit: number): Promise<any> => {
        const rest: TribeResult<any> = await this._rpc.post('/tribe/selectedTribeMsg', {
            tribeId: tribeId,
            skip: skip,
            limit: limit
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    updateTribe = async (theme: TribeTheme): Promise<boolean> => {
        await this.userCheckAuth()
        const rest: TribeResult<any> = await this._rpc.post('/tribe/updateTribe', theme);
        if (rest && rest.code == 0) {
            await tribeService.tribeInfoNoCache(config.tribeId)
            return Promise.resolve(true)
        }
        return Promise.reject(rest.message);
    }

    summarizeTribe = async (tribeId: string, msgIds: Array<string>): Promise<boolean> => {
        await this.userCheckAuth()
        const rest: TribeResult<boolean> = await this._rpc.post('/tribe/summarizeTribe', {tribeId, msgIds});
        if (rest && rest.code == 0) {
            return Promise.resolve(true)
        }
        return Promise.reject(rest.message);
    }

    tribeInfo = async (tribeId: string): Promise<TribeInfo> => {
        const _key = `tribeInfo_${tribeId}`;
        const dataStr = sessionStorage.getItem(_key);
        if (dataStr) {
            const data: TribeInfo = JSON.parse(dataStr)
            this.tribeInfoNoCache(tribeId).catch(e => console.error(e))
            return Promise.resolve(data);
        } else {
            return this.tribeInfoNoCache(tribeId);
        }
    }

    tribeInfoNoCache = async (tribeId: string): Promise<TribeInfo> => {
        const _key = `tribeInfo_${tribeId}`;
        const rest: TribeResult<TribeInfo> = await this._rpc.post('/tribe/tribeInfo', {tribeId});
        if (rest && rest.code == 0) {
            if (config.tribeId && config.tribeId == tribeId) {
                this._tribeInfo = rest.data;
            }
            sessionStorage.setItem(_key, JSON.stringify(rest.data))
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    userLimit = async (tribeId: string): Promise<UserLimit> => {
        const rest: TribeResult<UserLimit> = await this._rpc.post('/tribe/userLimit', {tribeId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    userNFTs = async (): Promise<Array<CatInfo>> => {
        const account = await emitBoxSdk.getAccount();
        const rest: TribeResult<Array<CatInfo>> = await this._rpc.post('/tribe/userNFTs', {user: account && account.addresses[ChainType.EMIT]});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    setUserNFTName = async (nftId: string, name: string): Promise<Array<CatInfo>> => {
        const rest: TribeResult<Array<CatInfo>> = await this._rpc.post('/tribe/setUserNFTName', {
            id: nftId,
            name: name
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    // dispatchNoki = async (): Promise<Array<CatInfo>> => {
    //     const account =await emitBoxSdk.getAccount();
    //     const rest: TribeResult<Array<CatInfo>> = await this._rpc.post('/tribe/userNFTs', {
    //         "sign":"38a97a9fb44489bce15ebe5",
    //         user: account && account.addresses[ChainType.EMIT]});
    //     if (rest && rest.code == 0) {
    //         return Promise.resolve(rest.data)
    //     }
    //     return Promise.reject(rest.message);
    // }

    tribeRoles = async (tribeId: string, cache: boolean = true): Promise<Array<TribeRole>> => {
        if(cache){
            const _key = `tribeRole_${tribeId}`;
            const dataStr = selfStorage.getItem(_key);
            if (dataStr) {
                const data: Array<TribeRole> = dataStr
                this._tribeRolesFn(tribeId).catch(e => console.error(e))
                const ret = data.filter(v => !v.hide)
                // ret.sort(this._sortRole)
                return Promise.resolve(ret);
            }
        }
        return this._tribeRolesFn(tribeId);
    }


    private _sortRole = (a:TribeRole, b: TribeRole) =>{
        if(!a.roleType && !b.roleType || !!a.roleType && !! b.roleType ){
            return a.createdAt - b.createdAt
        }else if (!a.roleType && !!b.roleType){
            return 1
        }else if(!!a.roleType && !b.roleType){
            return -1
        }
    }

    private _tribeRolesFn = async (tribeId: string): Promise<Array<TribeRole>> => {
        const _key = `tribeRole_${tribeId}`;
        const account = await emitBoxSdk.getAccount();
        const rest: TribeResult<Array<TribeRole>> = await this._rpc.post('/tribe/tribeUserRoles', {
            tribeId,
            user: account && account.addresses[ChainType.EMIT]
        });
        const defaultRole = {
            avatar: {
                url: `https://pic.emit.technology/img/3ce83e299e485e006cd9e820ea9c790f.png`,
                height: 300,
                width: 300
            },
            name: "Narrator",
            id: "",
            tribeId: config.tribeId
        }
        if (rest && rest.code == 0) {
            if (rest.data) {
                let ret = rest.data.reverse();
                ret = ret.filter(v => !v.hide)
                ret = ret.map(v => {
                    if (v.id == v.name) {
                        v.name = "Noki"
                    }
                    return v
                })

                ret.sort(this._sortRole)

                ret.unshift(defaultRole)
                this._tribeRole = ret;
                selfStorage.setItem(_key, ret)
                return Promise.resolve(ret)
            }
            this._tribeRole = [defaultRole];
            selfStorage.setItem(_key, [defaultRole])
            return [defaultRole]
        }
        return Promise.reject(rest.message);
    }

    public defaultTheme = async (): Promise<PinnedSticky> => {
        if (!this._tribeRole) {
            await tribeService.tribeRoles(config.tribeId);
        }
        if (!this._tribeInfo) {
            await tribeService.tribeInfo(config.tribeId);
        }
        return {
            roles: this._tribeRole,
            records: [],
            theme: this._tribeInfo.theme,
            seq: -1,
            index: -1,
            groupId: ""
        }

    }

    isSessionAvailable = async (): Promise<boolean> => {
        const rest = await this._rpc.post('/user/checkAuth', null)
        if (rest && rest.code == 0) {
            return true
        }
        return false
    }

    userCheckAuth = async (): Promise<string> => {
        const rest: TribeResult<{ userName: string }> = await this._rpc.post('/user/checkAuth', null);
        let authToken: string;
        if (rest && rest.code == 0) {
            authToken = tribeService.getAuthToken();
        }
        if (rest.code == 40000) {
            try {
                authToken = await this.getAccountAndLogin();
            } catch (e) {
                const err: string = typeof e == 'string' ? e : e.message;
                if (err && err.indexOf("Account locked") > -1) {
                    return Promise.reject("Account not login!")
                }
                return Promise.reject(e)
            }
        }
        if (authToken) {
            await tribeWorker.checkAlive(config.tribeId)
            return Promise.resolve(authToken as string)
        }
        return Promise.reject(rest.message);
    }

    isApp = async () => {
        try {
            const deviceInfo = await Device.getInfo();
            return deviceInfo.platform == "ios" || deviceInfo.platform == "android"
        } catch (e) {
            console.error(e)
        }
        return false;
    }

    userLogin = async (signRet: { r: string, s: string, v: string }): Promise<string> => {
        const params: any = signRet;

        if (await this.isApp()) {
            params["deviceInfo"] = await this._genDeviceInfo();
        } else {
            // params["deviceInfo"] = await Device.getInfo();
        }
        const rest: TribeResult<string> = await this._rpc.post('/user/login', params);
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    _genDeviceInfo = async (pushTokenValue?: string) => {
        if (await this.isApp()) {
            const deviceInfo = await Device.getInfo();
            const deviceId = await Device.getId();
            const appInfo = await App.getInfo();
            const params: any = deviceInfo;
            if (!pushTokenValue) {
                pushTokenValue = selfStorage.getItem("pushTokenValue")
            }
            params["uuid"] = deviceId.uuid;
            params["appVersion"] = appInfo.version;
            params["pushTokenValue"] = pushTokenValue;
            console.log("=====> genned device info: ", params)
            return params;
        }
        return null;
    }

    registerDevice = async (pushTokenValue?: string): Promise<string> => {
        const params = await this._genDeviceInfo(pushTokenValue);
        if (!params) {
            return Promise.reject("Only in ios or android!")
        }
        const cacheParams: any = selfStorage.getItem("deviceInfo")
        if (!cacheParams || (cacheParams["uuid"] != params["uuid"]
            || cacheParams["appVersion"] != params["appVersion"]
            || cacheParams["pushTokenValue"] != params["pushTokenValue"])) {

            const rest: TribeResult<string> = await this._rpc.post('/user/registerDevice', params);
            if (rest && rest.code == 0) {
                selfStorage.setItem("deviceInfo", params)
                return Promise.resolve(rest.data)
            }
            return Promise.reject(rest.message);
        }
    }

    getAccountAndLogin = async (): Promise<string> => {
        const accountLocal = await emitBoxSdk.getAccount();

        if (utils.useInjectAccount()) {
            return await tribeService.accountLogin(accountLocal)
        }
        const rest: { error: string, result: AccountModel } = await emitBoxSdk.emitBox.requestAccount(accountLocal && accountLocal.accountId);
        if (!rest || rest.error) {
            return Promise.reject(rest.error)
        }
        const account = rest.result;
        //TODO get nonce
        const signResult = await emitBoxSdk.emitBox.batchSignMsg([
            {
                chain: ChainType.EMIT.valueOf(), msg: {data: "0x" + Buffer.from("emit-trib login msg").toString("hex")},
                address: account.addresses[ChainType.EMIT.valueOf()]
            }
        ])
        if (signResult && signResult[0]) {
            const sig = signResult[0];
            // config.authToken = "T-9d-2qQeHYaK9zn3L9rVLsnZulR26D2FV05XvczLic="
            const authToken = await tribeService.userLogin({
                r: sig.result["r"] as string,
                s: sig.result["s"] as string,
                v: sig.result["v"] as string
            });
            await emitBoxSdk.setAccount(account)
            tribeService.setAuthToken(authToken);
            // selfStorage.setItem("authToken", authToken)
            return authToken;
        }

        return Promise.reject("Login failed");

    }

    accountLogin = async (account: AccountModel): Promise<string> => {
        if (!account) {
            return Promise.reject("No account is available. Please create a new account first!")
        }
        const sig: any = await walletWorker.personSignMsg(ChainType.EMIT.valueOf(),
            {data: "0x" + Buffer.from("emit-trib login msg").toString("hex")},
            account.accountId)
        const authToken = await tribeService.userLogin({
            r: sig["r"] as string,
            s: sig["s"] as string,
            v: sig["v"] as string
        });
        await emitBoxSdk.setAccount(account)
        tribeService.setAuthToken(authToken);
        return authToken;
    }

    userLogout = async (): Promise<boolean> => {
        // const rest: TribeResult<boolean> = await
        const isAlive = await this.isSessionAvailable();
        if (isAlive) {
            const rest: TribeResult<boolean> = await this._rpc.post('/user/logout', null);
            if (rest && rest.code == 0) {
                tribeService.setAuthToken("logout token");
                tribeWorker.logout()
                return Promise.resolve(true)
            }
            return Promise.reject(rest.message);
        }
        return true;

    }

    picUpload = async (): Promise<Photo> => {
        // await this.userCheckAuth()
        return await this._picRpc.upload()
    }

    uploadToServer = async (image: any) => {
        try {
            const themeColors = await getMainColor(image.webPath);
            const file = await fetch(image.webPath).then(r => r.blob()).then(blobFile => new File([blobFile], `file.${image.format}`, {type: blobFile.type}));
            const data = await this._picRpc.uploadFile(file);
            return {url: data["url"].replace("http://", "https://"), themeColors: themeColors};
        } catch (e) {
            console.error(e)
            return Promise.reject(e)
        }
    }

    uploadServer = async (file: File): Promise<string> => {
        try {
            const data = await this._picRpc.uploadFile(file);
            return data["url"].replace("http://", "https://");
        } catch (e) {
            console.error(e)
            return Promise.reject(e)
        }
    }

    picDisplay = async (imgPath: string, w: number = 100, h: number = 100, upscale = 0): Promise<string> => {
        return await this._picRpc.get(`display?url=${config.picHost}${imgPath}&w=${w}&h=${h}&op=resize&upscale=${upscale}`)
    }

    pushTribe = async (data: { tribeId: string, msgType: MessageType, role: string, content: string, replayToMsgId?: string }): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/push/pushTribe', data);
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    setAuthToken = (authToken: string) => {
        // selfStorage.setItem(`authToken_${config.tribeId}`, authToken)
        selfStorage.setItem(`authToken`, authToken)
    }

    getAuthToken = () => {
        // return selfStorage.getItem(`authToken_${config.tribeId}`)
        return selfStorage.getItem(`authToken`)
    }

    connectW3C = (tribeId: string, cb: Function) => {
        console.log("connect....")
        const authToken = tribeService.getAuthToken();
        this._wsW3C = new W3CWebSocket(config.tribeWs, 'echo-protocol');

        this._wsW3C.onerror = () => {
            console.log('Connection Error');
        };

        this._wsW3C.onopen = () => {
            console.log('WebSocket Client Connected');

            console.log("opened")
            this._wsW3C.send(JSON.stringify({tribeId: tribeId, authToken: authToken}))
        };

        this._wsW3C.onclose = () => {
            console.log('echo-protocol Client Closed');
            this.connectW3C(tribeId, cb)
        };

        this._wsW3C.onmessage = (e) => {
            if (typeof e.data === 'string') {
                cb(e.data);
            }
        };

        if (this._wsIntervalId) {
            clearInterval(this._wsIntervalId)
        }
        this._wsIntervalId = setInterval(() => {
            if (this._wsW3C) {
                console.log("ping...")
                this._wsW3C.send('ping');
            }
        }, 30 * 1000)
    }

    connectOrigin = (tribeId: string, cb: Function) => {
        console.log("connect origin....")
        const authToken = tribeService.getAuthToken();

        this._wsOrigin = new WebSocket(config.tribeWs);

        this._wsOrigin.addEventListener('open', () => {
            console.log("opened")
            this._wsOrigin.send(JSON.stringify({tribeId: tribeId, authToken: authToken}))
        })

        this._wsOrigin.addEventListener('close', () => {
            console.log("closed")
            this.connectOrigin(tribeId, cb);
        });

        this._wsOrigin.addEventListener('ping', () => {
            console.log("pong...")
            this._wsOrigin.send('pong')
        });

        this._wsOrigin.addEventListener('error', () => {
            console.log("error")
            setTimeout(() => {
                this.connectOrigin(tribeId, cb);
            }, 10 * 1000)
        });

        this._wsOrigin.addEventListener('message', (ev) => {
            cb(ev.data);
        });

        if (this._wsIntervalId) {
            clearInterval(this._wsIntervalId)
        }
        this._wsIntervalId = setInterval(() => {
            if (this._wsOrigin) {
                console.log("ping...")
                this._wsOrigin.send('ping');
            }
        }, 30 * 1000)
    }

    connect = (tribeId: string, cb: Function) => {
        console.log("connect....")
        const authToken = tribeService.getAuthToken();
        if (this._ws) {
            // this._ws.close();
            // this._ws = null;
            this._ws.send(JSON.stringify({tribeId: tribeId, authToken: authToken}))
        } else {
            this._ws = new WebsocketBuilder(config.tribeWs)
                .onOpen((i, ev) => {
                    console.log("opened")
                    this._ws.send(JSON.stringify({tribeId: tribeId, authToken: authToken}))
                })
                .onClose((i, ev) => {
                    console.log("closed")
                    this._ws.close();
                    this._ws = null;
                    this.userCheckAuth().then(e => {
                        this.connect(tribeId, cb);
                    }).catch(e => {
                        console.error(e);
                    })
                })
                .onError((i, ev) => {
                    console.log(i, ev)
                    console.log("error")
                    this._ws = null
                })
                .onMessage((i, ev) => {
                    cb(ev.data);
                })
                .onRetry((i, ev) => {
                    this._ws = null
                    this.connect(tribeId, cb);
                    console.log("retry")
                })
                .build();

            if (this._wsIntervalId) {
                clearInterval(this._wsIntervalId)
            }
            this._wsIntervalId = setInterval(() => {
                if (this._ws && this._wsIntervalId) {
                    console.log(this._ws.underlyingWebsocket.readyState, "this._ws.underlyingWebsocket.readyState")
                }
                if (this._ws && (!this._ws.underlyingWebsocket || this._ws.underlyingWebsocket.readyState != 1)) {
                    console.log("reconnect....")
                    this.connect(tribeId, cb);
                }
            }, 30 * 1000)
        }
    };

    getCacheMsg = (tribeId: string): { msgs: Array<Message>, roles: Array<TribeRole>, groupIds: Array<string> } => {
        return {
            msgs: selfStorage.getItem(`tribe_msg_${tribeId}`) as Array<Message>,
            roles: selfStorage.getItem(`tribe_role_${tribeId}`) as Array<TribeRole>,
            groupIds: selfStorage.getItem(`tribe_groupIds_${tribeId}`) as Array<string>,
        };
    }

    setCacheMsg = (tribeId: string, msgs?: Array<Message>, roles?: Array<TribeRole>, groupIds?: Array<string>) => {
        if (msgs) {
            selfStorage.setItem(`tribe_msg_${tribeId}`, msgs);
        }
        if (roles) {
            selfStorage.setItem(`tribe_role_${tribeId}`, roles);
        }
        if (groupIds) {
            selfStorage.setItem(`tribe_groupIds_${tribeId}`, groupIds);
        }
        return
    }

    groupIds = async (tribeId: string): Promise<Array<string>> => {
        const rest: TribeResult<Array<string>> = await this._rpc.post('/tribe/groupIds', {tribeId: tribeId});
        if (rest && rest.code == 0) {
            if (rest.data) {
                this._groupIds = rest.data;
                this._groupIds.push("")
                return Promise.resolve(rest.data)
            } else {
                return []
            }
        }
        return Promise.reject(rest.message);
    }

    groupIdCache = (): Array<string> => this._groupIds;

    private groupStaticKey = () => `tribe_${config.tribeId}_static`;


    private _groupedInfosFn = async (tribeId: string): Promise<{ total: number, groupNum: Array<{ groupId: string, num: number }> }> => {
        const rest: TribeResult<Array<{ [groupId: string]: MsgStaticInfo }>> = await this._rpc.post('/tribe/groupedInfos', {tribeId: tribeId});
        if (rest && rest.code == 0) {
            let total = 0;
            const groupNumArr: Array<{ groupId: string, num: number }> = [];
            for (let data of rest.data) {
                const keys = Object.keys(data);
                const value: MsgStaticInfo = data[keys[0]];
                groupNumArr.push({groupId: keys[0], num: value.messages});
                total += value.messages;
            }
            this._groupStatic = {total: total, groupNum: groupNumArr}
            selfStorage.setItem(this.groupStaticKey(), this._groupStatic);
            return Promise.resolve(this._groupStatic)
        }
        return Promise.reject(rest.message);
    }

    private groupedInfos = async (tribeId: string): Promise<{ total: number, groupNum: Array<{ groupId: string, num: number }> }> => {
        let cache = selfStorage.getItem(this.groupStaticKey());
        if (!cache) {
            cache = await this._groupedInfosFn(tribeId);
        } else {
            this._groupedInfosFn(tribeId).catch(e => console.log(e))
        }
        return cache;
    }

    getMsgPosition = async (msgId: string) => {
        const msgInfo = await tribeService.msgInfo(msgId);

        const groupIndex = this._groupStatic.groupNum.findIndex(v => v.groupId == msgInfo.groupId)
        let preMsgCount = 0;
        if (groupIndex > 0) {
            for (let i = 0; i < groupIndex; i++) {
                const v = this._groupStatic.groupNum[i];
                preMsgCount += v.num;
            }
        }
        return preMsgCount + msgInfo.msgIndex;
    }

    getMsgPositionWithGroupId = async (groupId: string) => {
        // const groupMsgArr = await tribeService.groupedMsg([msgStatic.groupId])
        const groupIndex = this._groupStatic.groupNum.findIndex(v => v.groupId == groupId)
        let preMsgCount = 0;
        if (groupIndex > 0) {
            for (let i = 0; i < groupIndex; i++) {
                const v = this._groupStatic.groupNum[i];
                preMsgCount += v.num;
            }
        }
        return preMsgCount;
    }

    msgGrouedInfo = async (msgId: string): Promise<MsgStaticInfo> => {
        const rest: TribeResult<MsgStaticInfo> = await this._rpc.post('/tribe/msgGrouedInfo', {msgId: msgId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    streamMsg = async (tribeId: string, current: number, limit: number): Promise<StreamMsg> => {
        const rest: TribeResult<StreamMsg> = await this._rpc.post('/tribe/streamMsg', {
            tribeId,
            current: current,
            limit
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return {total: 0, records: []}
        // return Promise.reject(rest.message);
    }

    private _groupMsgKey = (groupId: string) => {
        return `tribe_${config.tribeId}_group_v2_${groupId}`;
    }

    groupedMsgRemove = async (groupIds: Array<string> = [], withDraft: boolean = false): Promise<Array<GroupMsg>> => {
        if (!groupIds || groupIds.length == 0) {
            return []
        }
        const rest: TribeResult<Array<GroupMsg>> = await this._rpc.post('/tribe/groupedMsg', {
            groupIds: groupIds,
            withDraft
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        } else {
            return Promise.reject(rest.message);
        }
    }

    groupedMsgInit = async (groupIds: Array<string> = [], withDraft: boolean = false): Promise<void> => {
        this._groupMap = await this.groupedMsg(groupIds, withDraft);
    }


    groupedMsg = async (groupIds: Array<string> = [], withDraft: boolean = false): Promise<Array<GroupMsg>> => {
        if (!groupIds) {
            return []
        }
        const ret: Array<GroupMsg> = [];
        const unFetchGroupIds = [];
        for (let str of groupIds) {
            const data = selfStorage.getItem(this._groupMsgKey(str))
            if (!data) {
                unFetchGroupIds.push(str);
            } else {
                ret.push(data)
            }
        }
        if (unFetchGroupIds.length > 1) {
            const rest: TribeResult<Array<GroupMsg>> = await this._rpc.post('/tribe/groupedMsg', {
                tribeId: config.tribeId,
                groupIds: (unFetchGroupIds.slice(0, unFetchGroupIds.length - 1)),
                withDraft
            });
            if (rest && rest.code == 0) {
                for (let i = 0; i < rest.data.length; i++) {
                    const groupMsg = rest.data[i];
                    groupMsg.groupId = unFetchGroupIds[i];
                    groupMsg.records = [];
                    selfStorage.setItem(this._groupMsgKey(unFetchGroupIds[i]), groupMsg)
                    ret.push(groupMsg)
                }
            } else {
                return Promise.reject(rest.message);
            }
        }
        // for(let msg of ret){
        //     msg.theme.image["url"] = await utils.toLocalImageUrl(utils.getDisPlayUrl(msg.theme.image))
        // }
        // console.log(ret)
        return Promise.resolve(ret);

    }

    forkTribe = async (tribeId: string, groupId: string, tribeInfo: TribeInfo): Promise<string> => {
        await this.userCheckAuth()
        const data: any = {
            groupId: groupId,
            FromTribeId: tribeId, title: tribeInfo.title
        };
        const keys = Object.keys(tribeInfo.theme);
        for (let key of keys) {
            data[key] = tribeInfo.theme[key]
        }
        const rest: TribeResult<string> = await this._rpc.post('/tribe/forkTribe', data);
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    deleteMsg = async (msgId: string): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/tribe/deleteMsg', {msgId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    updateMsg = async (msgId: string, content: string, role?: string, replayToMsgId?: string): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/tribe/updateMsg', {
            msgId,
            role,
            content,
            replayToMsgId
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    forbidTribe = async (tribeId: string): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/tribe/forbidTribe', {
            tribeId
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    unForbidTribe = async (tribeId: string): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/tribe/unForbidTribe', {
            tribeId
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    dropTribe = async (tribeId: string): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/tribe/dropTribe', {
            tribeId
        });
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    airdropRecords = async (msgId: string): Promise<Array<AirdropInfo>> => {
        // await this.userCheckAuth()
        const rest: TribeResult<Array<AirdropInfo>> = await this._rpc.post('/tribe/airdropRecords', {msgId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    msgInfo = async (msgId: string): Promise<Message> => {
        const rest: TribeResult<Message> = await this._rpc.post('/tribe/msgInfo', {msgId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }


    tribeUserInfo = async (tribeId?: string): Promise<{ limit: UserLimit, subscribed: boolean }> => {
        const account = await emitBoxSdk.getAccount();
        if (!!account) {
            const address = account.addresses[ChainType.EMIT]
            const rest: TribeResult<{ limit: UserLimit, subscribed: boolean }> = await this._rpc.post('/tribe/tribeUserInfo', {
                tribeId: tribeId ? tribeId : config.tribeId,
                user: address
            });
            if (rest && rest.code == 0) {
                return Promise.resolve(rest.data)
            }
            return Promise.reject(rest.message);
        }
        return null;
    }

    myTribes = async (): Promise<Array<TribeInfo>> => {
        const account = await emitBoxSdk.getAccount();
        const address = account ? account.addresses[ChainType.EMIT] : ""
        const rest: TribeResult<Array<TribeInfo>> = await this._rpc.post('/tribe/myTribes', {userId: address});
        if (rest && rest.code == 0) {
            const ret = rest.data;
            ret.sort(tribeService._sortTribeInfo);

            selfStorage.setItem("myTribes", ret)
            return Promise.resolve(ret)
        }
        return Promise.reject(rest.message);
    }

    involvedTribes = async (): Promise<Array<TribeInfo>> => {
        const account = await emitBoxSdk.getAccount();
        const address = account && account.addresses && account.addresses[ChainType.EMIT]
        const rest: TribeResult<Array<TribeInfo>> = await this._rpc.post('/tribe/involvedTribes', {userId: address});
        if (rest && rest.code == 0) {
            const ret = rest.data;
            ret.sort(tribeService._sortTribeInfo);

            selfStorage.setItem("involvedTribes", ret)
            return Promise.resolve(ret)
        }
        return Promise.reject(rest.message);
    }

    private _sortTribeInfo = (a:TribeInfo, b:TribeInfo) =>{
        let aTime = !a.latestMsg? 0 : a.latestMsg.timestamp;
        let bTime = !b.latestMsg? 0 : b.latestMsg.timestamp;
        if(aTime == 0 && bTime == 0){
            aTime = a.reads;
            bTime = b.reads;
        }
        return bTime - aTime;
    }

    // dropTribe = async (tribeId: string): Promise<boolean> => {
    //     const rest: TribeResult<Array<TribeInfo>> = await this._rpc.post('/tribe/dropTribe', {tribeId: tribeId});
    //     if (rest && rest.code == 0) {
    //         return true
    //     }
    //     return Promise.reject(rest.message);
    // }

    subscribeTribe = async (tribeId: string): Promise<boolean> => {
        await this.userCheckAuth()
        const rest: TribeResult<Array<TribeInfo>> = await this._rpc.post('/tribe/subscribeTribe', {tribeId: tribeId});
        if (rest && rest.code == 0) {
            return true
        }
        return Promise.reject(rest.message);
    }

    unSubscribeTribe = async (tribeId: string): Promise<boolean> => {
        await this.userCheckAuth()
        const rest: TribeResult<Array<TribeInfo>> = await this._rpc.post('/tribe/unSubscribeTribe', {tribeId: tribeId});
        if (rest && rest.code == 0) {
            return true
        }
        return Promise.reject(rest.message);
    }

    convertGroupMsgToPinnedSticky = (groupTribes: Array<GroupMsg>): Array<PinnedSticky> => {
        const stickies: Array<PinnedSticky> = [];
        let i = 0;
        let j = 0;
        const _sort = (m1: Message, m2: Message) => m1.timestamp - m2.timestamp;
        for (let gt of groupTribes) {
            if (gt.records && gt.records.length == 0) {
                continue;
            }
            i++;
            // let tmpMsg: Message = JSON.parse(JSON.stringify(gt.records[0]));
            // tmpMsg.msgType = MessageType.Divide
            // tmpMsg.id = ""
            // stickies.push({
            //     theme: gt.theme,
            //     seq: i,
            //     roles: gt.roles,
            //     records: [tmpMsg],
            //     groupId: tmpMsg.groupId,
            //     index: j++
            // })
            gt.records.sort(_sort)
            for (let r of gt.records) {
                r.actor = gt.roles.find(role => role.id == r.role);
                if (r.msgStatus == MessageStatus.removed) {
                    continue
                }
                stickies.push({
                    theme: gt.theme,
                    seq: i,
                    roles: gt.roles,
                    records: [r],
                    groupId: r.groupId,
                    index: j++
                })
            }

        }
        console.log("stickies>>> ", stickies)
        return stickies
    }

    convertGroupMsgToPinnedStickyWithSeq = (groupTribes: Array<GroupMsg>, seq: number): Array<PinnedSticky> => {
        const stickies: Array<PinnedSticky> = [];
        let i = 0;
        let j = 0;
        const _sort = (m1: Message, m2: Message) => m1.timestamp - m2.timestamp;
        for (let gt of groupTribes) {
            if (gt.records && gt.records.length == 0) {
                continue;
            }
            i++;
            let tmpMsg: Message = JSON.parse(JSON.stringify(gt.records[0]));
            tmpMsg.msgType = MessageType.Divide
            tmpMsg.id = ""
            stickies.push({
                theme: gt.theme,
                seq: seq,
                roles: gt.roles,
                records: [tmpMsg],
                groupId: tmpMsg.groupId,
                index: j++
            })
            gt.records.sort(_sort)
            for (let r of gt.records) {
                if (r.msgStatus == MessageStatus.removed) {
                    continue
                }
                r.actor = gt.roles.find(role => role.id == r.role);
                stickies.push({
                    theme: gt.theme,
                    seq: seq,
                    roles: gt.roles,
                    records: [r],
                    groupId: r.groupId,
                    index: j++
                })
            }

        }
        return stickies
    }

    pushMessageToPinnedSticky = (stickies: Array<PinnedSticky>, data: Array<Message>, tribeInfo: TribeInfo, roles: Array<TribeRole>): Array<PinnedSticky> => {
        if (stickies && data && tribeInfo && roles) {
            const copy = [...stickies];
            let i = 0;
            copy.push({
                theme: tribeInfo.theme,
                seq: stickies.length + 1,
                roles: roles,
                records: [{
                    id: "",
                    tribeId: config.tribeId,
                    owner: "",
                    timestamp: Math.floor(Date.now() / 1000),
                    content: {content: ""} as MsgText,
                    groupId: "",
                    msgStatus: MessageStatus.dashed,
                    role: "",
                    seq: stickies.length + 1,
                    support: 0,
                    msgType: MessageType.Divide,
                    theme: tribeInfo.theme,
                }],
                groupId: "",
                index: copy.length + (i++)
            })
            if (data && data.length > 0) {
                for (let msg of data) {
                    copy.push({
                        theme: tribeInfo.theme,
                        seq: stickies.length + 1,
                        roles: roles,
                        records: [msg],
                        groupId: "",
                        index: copy.length + (i++)
                    })
                }
            }
            return copy
        }

        return []
    }

    convertMessagesToPinnedSticky = async (messages: Array<Message>): Promise<Array<PinnedSticky>> => {
        let groupIds = this.getGroupIds(); //await tribeService.groupIds(config.tribeId);
        if (groupIds && groupIds.length == 0) {
            groupIds = await tribeService.groupIds(config.tribeId)
        }
        if (messages) {
            const copy = [];
            for (let msg of messages) {
                let groupMsg: GroupMsg = null;
                const groupIndex = this._groupMap.findIndex(v => v.groupId == msg.groupId);
                if (groupIndex == -1) {
                    if (!!msg.groupId) {
                        const groups = await tribeService.groupedMsg([msg.groupId])
                        groupMsg = groups[0];
                        groupMsg.groupId = msg.groupId;
                    } else {
                        if (!this._tribeInfo) {
                            await tribeService.tribeInfo(config.tribeId);
                        }
                        if (!this._tribeRole) {
                            await tribeService.tribeRoles(config.tribeId);
                        }
                        groupMsg = {
                            theme: this._tribeInfo.theme,
                            roles: this._tribeRole,
                            records: [],
                            groupId: ""
                        };
                    }
                } else {
                    groupMsg = this._groupMap[groupIndex];
                }
                const seq = groupIds.indexOf(msg.groupId);
                msg.actor = groupMsg.roles.find(v => v.id == msg.role);
                if (!!msg.replayToMsgId) {
                    //TODO cache msg
                    if (!this._cacheMsg.has(msg.replayToMsgId)) {
                        const rlyMsg = await tribeService.msgInfo(msg.replayToMsgId)
                        this._cacheMsg.set(msg.replayToMsgId, rlyMsg);
                    }
                    msg.replayMsg = this._cacheMsg.get(msg.replayToMsgId);
                }
                copy.push({
                    theme: groupMsg.theme,
                    seq: seq + 1,
                    roles: groupMsg.roles,
                    records: [msg],
                    groupId: msg.groupId,
                    index: msg.msgIndex
                })
            }
            return copy
        }
        return []
    }


    uploadFile = async (file: File) => {
        return await this._picRpc.uploadFile(file);
    }

    setConnectWs = (cb: Function) => {
        let count = 0;
        tribeService.connectOrigin(config.tribeId, async (newMessage) => {
            let messagesCopy: Array<Message> = [];
            const release = await this._lock()
            try {
                const isFirst = count++ == 0;
                const coverData = JSON.parse(newMessage);
                const msgs: Array<Message> = coverData["msgs"];
                const tribeInfo: TribeInfo = coverData["tribeInfo"]
                let rest = tribeService.getCacheMsg(config.tribeId);
                let data = rest.msgs;
                let roles = rest.roles;
                // let groupIds = rest.groupIds;
                // let roles = await tribeService.tribeRoles(config.tribeId)
                let groupIds = await tribeService.groupIds(config.tribeId);
                if (!roles) {
                    roles = []
                }
                if (!data) {
                    data = [];
                }

                const isPinned = (!msgs || msgs.length == 0) && rest && groupIds && rest.groupIds.length < groupIds.length;

                messagesCopy = isFirst || isPinned ? [] : [...data];
                if (roles && roles.length > 0 && msgs && msgs.length > 0) {
                    const msgb = msgs.map(v => {
                        v.actor = roles.find(r => r.id == v.role);
                        v.theme = tribeInfo && tribeInfo.theme;
                        return v;
                    })
                    const delMsgArr: Array<string> = [];
                    for (let value of msgb) {
                        if (value.msgType == MessageType.Support) {
                            continue;
                        }
                        let msgId = value.id;
                        if (value.msgStatus == MessageStatus.removed) {
                            delMsgArr.push(msgId)
                        }
                        const index = messagesCopy.findIndex(pv => pv.id == msgId);
                        // if (value.msgType == MessageType.Support) {
                        //     msgId = (value.content as Support).msgId;
                        // }
                        if (index > -1) {
                            const msg = messagesCopy[index]
                            if (value.timestamp >= msg.timestamp) {
                                messagesCopy.splice(index, 1, value);
                            } else {
                                console.log("msg is outdated >", value, msg)
                            }
                        } else {
                            messagesCopy.push(value)
                        }
                    }

                    delMsgArr.forEach(msgId => {
                        const index = messagesCopy.findIndex(pv => pv.id == msgId);
                        messagesCopy.splice(index, 1)
                    })
                }
                // const msg = messagesCopy; // messagesCopy.filter(v => new BigNumber(v.seq).comparedTo(new BigNumber(tribeInfo.lastPinedSeq)) > 0 )
                tribeService.setCacheMsg(config.tribeId, messagesCopy, roles, groupIds)
            } catch (e) {
                console.error(e);
            } finally {
                cb(messagesCopy)
                release()
                console.log("release ...")
            }
        })

    }

    urlMetadata = (url: string) => {
        const _cache = selfStorage.getItem(`metadata_${url}`);
        if (_cache) {
            return _cache
        }
    }

    catItems = async (): Promise<Array<CatInfo>> => {
        const arr = await tribeService.userNFTs()
        return arr.map(v => {
            // v.image = `${config.tribePic}/display?url=${v.image}&w=${300}&h=${300}&op=resize&upscale=1`
            return v
        });
    }


}

export const tribeService = new TribeService();