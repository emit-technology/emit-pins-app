import {ITribe} from "./interface";
import {
    AirdropInfo,
    GroupMsg,
    ImageType,
    Message,
    MessageStatus,
    MessageType,
    MsgText,
    PinnedSticky,
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
import {ThemeColors} from "../../common/getMainColor";
import {emitBoxSdk} from "../emitBox";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import tribeWorker from "../../worker/imWorker";
import {utils} from "../../common";
import {App} from "@capacitor/app";
import walletWorker from "../../worker/walletWorker";
// import WebSocket from 'ws';

const W3CWebSocket = require('websocket').w3cwebsocket;
// const ws = require('ws');

const mutexify = require('mutexify/promise')
class TribeService implements ITribe {

    _rpc: BaseRpc;
    _ws: Websocket;
    _wsOrigin: WebSocket;
    _wsW3C: any;
    _picRpc: BaseRpc;
    _wsIntervalId: any;

    _lock: any;
    constructor() {
        this._rpc = new BaseRpc(config.tribeNode);
        this._picRpc = new BaseRpc(config.tribePic);
        this._lock = mutexify()
    }

    checkWorkerIsAlive = async ()=>{
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

    creatTribe = async (tribeInfo: { title: string, desc: string, color: string, backgroundColor: string, image: ImageType,themeTag:string,themeDesc:string }): Promise<string> => {
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
        const rest: TribeResult<TribeInfo> = await this._rpc.post('/tribe/tribeInfo', {tribeId});
        if (rest && rest.code == 0) {
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

    tribeRoles = async (tribeId: string): Promise<Array<TribeRole>> => {
        const rest: TribeResult<Array<TribeRole>> = await this._rpc.post('/tribe/tribeRoles', {tribeId});
        const defaultRole = {
            avatar: `${config.baseUrl}/pic/display?url=https://pic.emit.technology/img/3ce83e299e485e006cd9e820ea9c790f.png&w=300&h=300&op=resize&upscale=1`,
            name: "Narrator",
            id: "",
            tribeId: config.tribeId
    }
        if (rest && rest.code == 0) {
            if (rest.data) {
                const ret = rest.data.reverse();
                ret.unshift(defaultRole)
                return Promise.resolve(ret)
            }
            return [defaultRole]
        }
        return Promise.reject(rest.message);
    }

    isSessionAvailable = async () : Promise<boolean> =>{
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
            authToken = await this.getAccountAndLogin();
        }
        if(authToken){
            await tribeWorker.checkAlive(config.tribeId)
            return Promise.resolve(authToken as string)
        }
        return Promise.reject(rest.message);
    }

    userLogin = async (signRet: { r: string, s: string, v: string }): Promise<string> => {
        const rest: TribeResult<string> = await this._rpc.post('/user/login', signRet);
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    getAccountAndLogin = async (): Promise<string> => {
        const accountLocal = await emitBoxSdk.getAccount();

        if(utils.useInjectAccount()){
            return await tribeService.accountLogin(accountLocal)
        }
        const rest: { error: string, result: AccountModel } = await emitBoxSdk.emitBox.requestAccount(accountLocal && accountLocal.accountId);
        if(!rest || rest.error){
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
        if(signResult && signResult[0]){
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

    accountLogin = async (account: AccountModel): Promise<string>=>{
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
        const rest: TribeResult<boolean> = await this._rpc.post('/user/logout', null);
        if (rest && rest.code == 0) {
            return Promise.resolve(true)
        }
        return Promise.reject(rest.message);
    }

    picUpload = async (): Promise<{ url: string, themeColors: ThemeColors }> => {
        // await this.userCheckAuth()
        return await this._picRpc.upload()
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

    setAuthToken = (authToken:string) =>{
        // selfStorage.setItem(`authToken_${config.tribeId}`, authToken)
        selfStorage.setItem(`authToken`, authToken)
    }

    getAuthToken = () =>{
        // return selfStorage.getItem(`authToken_${config.tribeId}`)
        return selfStorage.getItem(`authToken`)
    }

    connectW3C = (tribeId: string, cb: Function) =>{
        console.log("connect....")
        const authToken = tribeService.getAuthToken();
        this._wsW3C = new W3CWebSocket(config.tribeWs, 'echo-protocol');

        this._wsW3C.onerror = ()=> {
            console.log('Connection Error');
        };

        this._wsW3C.onopen = ()=> {
            console.log('WebSocket Client Connected');

            console.log("opened")
            this._wsW3C.send(JSON.stringify({tribeId: tribeId, authToken: authToken}))
        };

        this._wsW3C.onclose = ()=> {
            console.log('echo-protocol Client Closed');
            this.connectW3C(tribeId,cb)
        };

        this._wsW3C.onmessage = (e)=> {
            if (typeof e.data === 'string') {
                cb(e.data) ;
            }
        };

        if(this._wsIntervalId){
            clearInterval(this._wsIntervalId)
        }
        this._wsIntervalId = setInterval(()=>{
            if(this._wsW3C){
                console.log("ping...")
                this._wsW3C.send('ping');
            }
        },30*1000)
    }

    connectOrigin = (tribeId: string, cb: Function) =>{
        console.log("connect origin....")
        const authToken = tribeService.getAuthToken();

        this._wsOrigin = new WebSocket(config.tribeWs);

        this._wsOrigin.addEventListener('open',()=>{
            console.log("opened")
            this._wsOrigin.send(JSON.stringify({tribeId: tribeId, authToken: authToken}))
        })

        this._wsOrigin.addEventListener('close',()=>{
            console.log("closed")
            this.connectOrigin(tribeId,cb);
        });

        this._wsOrigin.addEventListener('ping',()=>{
            console.log("pong...")
            this._wsOrigin.send('pong')
        });

        this._wsOrigin.addEventListener('error',()=>{
            console.log("error")
            setTimeout(()=>{
                this.connectOrigin(tribeId,cb);
            },10 * 1000)
        });

        this._wsOrigin.addEventListener('message',(ev)=>{
            cb(ev.data);
        });

        if(this._wsIntervalId){
            clearInterval(this._wsIntervalId)
        }
        this._wsIntervalId = setInterval(()=>{
            if(this._wsOrigin){
                console.log("ping...")
               this._wsOrigin.send('ping');
            }
        },30*1000)
    }

    connect = (tribeId: string, cb: Function) => {
        console.log("connect....")
        const authToken = tribeService.getAuthToken();
        if (this._ws){
            // this._ws.close();
            // this._ws = null;
            this._ws.send(JSON.stringify({tribeId: tribeId, authToken: authToken}))
        }else{
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
                    console.log(i,ev)
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

            if(this._wsIntervalId){
                clearInterval(this._wsIntervalId)
            }
            this._wsIntervalId = setInterval(()=>{
                if(this._ws && this._wsIntervalId){
                    console.log(this._ws.underlyingWebsocket.readyState,"this._ws.underlyingWebsocket.readyState")
                }
                if(this._ws && (!this._ws.underlyingWebsocket || this._ws.underlyingWebsocket.readyState != 1)){
                    console.log("reconnect....")
                    this.connect(tribeId, cb);
                }
            },30*1000)
        }
    };

    getCacheMsg = (tribeId: string): { msgs: Array<Message>, roles: Array<TribeRole> ,groupIds:Array<string>} => {
        return {
            msgs: selfStorage.getItem(`tribe_msg_${tribeId}`) as Array<Message>,
            roles: selfStorage.getItem(`tribe_role_${tribeId}`) as Array<TribeRole>,
            groupIds: selfStorage.getItem(`tribe_groupIds_${tribeId}`) as Array<string>,
        };
    }

    setCacheMsg = (tribeId: string, msgs?: Array<Message>, roles?: Array<TribeRole>,groupIds?:Array<string>) => {
        if(msgs){
            selfStorage.setItem(`tribe_msg_${tribeId}`, msgs);
        }
        if(roles){
            selfStorage.setItem(`tribe_role_${tribeId}`, roles);
        }
        if(groupIds){
            selfStorage.setItem(`tribe_groupIds_${tribeId}`, groupIds);
        }
        return
    }

    groupIds = async (tribeId: string): Promise<Array<string>> => {
        const rest: TribeResult<Array<string>> = await this._rpc.post('/tribe/groupIds', {tribeId: tribeId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    _groupMsgKey = (groupId:string) =>{
        return `tribe_group_${groupId}`;
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

    groupedMsg = async (groupIds: Array<string> = [], withDraft: boolean = false): Promise<Array<GroupMsg>> => {

        if (!groupIds) {
            return []
        }
        const unFetchGroupIds = [];
        const ret: Array<GroupMsg> = [];
        for(let groupId of groupIds){
            const rest = selfStorage.getItem(this._groupMsgKey(groupId))
            if(rest){
                ret.push(rest)
            }else{
                unFetchGroupIds.push(groupId);
            }
        }
        if(unFetchGroupIds.length>0){
            const rest: TribeResult<Array<GroupMsg>> = await this._rpc.post('/tribe/groupedMsg', {
                groupIds: unFetchGroupIds,
                withDraft
            });
            if (rest && rest.code == 0) {
                for(let i =0;i<rest.data.length;i++){
                    const groupMsg = rest.data[i];
                    selfStorage.setItem(this._groupMsgKey(unFetchGroupIds[i]),groupMsg)
                    ret.push(groupMsg)
                }
            }else{
                return Promise.reject(rest.message);
            }
        }
        return Promise.resolve(ret);

    }

    forkTribe = async (tribeId: string, groupId: string,tribeInfo: TribeInfo): Promise<string> => {
        await this.userCheckAuth()
        const data:any = { groupId: groupId,
            FromTribeId: tribeId,};
        const keys = Object.keys(tribeInfo.theme);
        for(let key of keys){
            data[key]=tribeInfo.theme[key]
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

    updateMsg = async (msgId: string, content: string, role?: string,replayToMsgId?:string): Promise<string> => {
        await this.userCheckAuth()
        const rest: TribeResult<string> = await this._rpc.post('/tribe/updateMsg', {msgId,role, content,replayToMsgId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    airdropRecords = async (msgId: string): Promise<Array<AirdropInfo>> => {
        await this.userCheckAuth()
        const rest: TribeResult<Array<AirdropInfo>> = await this._rpc.post('/tribe/airdropRecords', {msgId});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    myTribes = async (): Promise<Array<TribeInfo>> => {
        const account = await emitBoxSdk.getAccount();
        const address = account.addresses[ChainType.EMIT]
        const rest: TribeResult<Array<TribeInfo>> = await this._rpc.post('/tribe/myTribes', {userId:address});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    involvedTribes = async (): Promise<Array<TribeInfo>> => {
        const account = await emitBoxSdk.getAccount();
        const address = account && account.addresses &&  account.addresses[ChainType.EMIT]
        const rest: TribeResult<Array<TribeInfo>> = await this._rpc.post('/tribe/involvedTribes', {userId:address});
        if (rest && rest.code == 0) {
            return Promise.resolve(rest.data)
        }
        return Promise.reject(rest.message);
    }

    convertGroupMsgToPinnedSticky = (groupTribes: Array<GroupMsg>): Array<PinnedSticky> => {
        const stickies: Array<PinnedSticky> = [];
        let i = 0;
        let j = 0;
        const _sort = (m1:Message,m2:Message)=> m1.timestamp - m2.timestamp;
        for (let gt of groupTribes) {
            if(gt.records && gt.records.length == 0){
                continue;
            }
            i++;
            let tmpMsg: Message = JSON.parse(JSON.stringify(gt.records[0]));
            tmpMsg.msgType = MessageType.Divide
            tmpMsg.id = ""
            stickies.push({
                theme: gt.theme,
                seq: i,
                roles: gt.roles,
                records: [tmpMsg],
                groupId: tmpMsg.groupId,
                index: j++
            })
            gt.records.sort(_sort)
            for (let r of gt.records) {
                if(r.msgStatus == MessageStatus.removed){
                    continue
                }
                r.actor = gt.roles.find(role => role.id == r.role);
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
                    timestamp: Math.floor(Date.now()/1000) ,
                    content: {content:""} as MsgText,
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
            if(data && data.length >0){
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

    convertMessagesToPinnedSticky = (messages:Array<Message>,roles:Array<TribeRole>,tribeInfo:TribeInfo): Array<PinnedSticky> => {
        if (messages && tribeInfo && roles) {
            const copy = [];
            let i = 0;
            for (let msg of messages) {
                copy.push({
                    theme: tribeInfo.theme,
                    seq: 0,
                    roles: roles,
                    records: [msg],
                    groupId: "",
                    index: (i++)
                })
            }

            return copy
        }
        return []
    }

    uploadFile = async (file:File)=>{
        return await this._picRpc.uploadFile(file);
    }

    setConnectWs = (cb: Function) => {
        let count = 0;
        tribeService.connectOrigin(config.tribeId,async (newMessage) => {
            let messagesCopy:Array<Message> = [];
            const release = await this._lock()
            try{
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

                const isPinned = (!msgs || msgs.length ==0) && rest && groupIds &&  rest.groupIds.length < groupIds.length ;

                messagesCopy = isFirst || isPinned  ? [] : [...data];
                if (roles && roles.length > 0 && msgs && msgs.length > 0) {
                    const msgb = msgs.map(v => {
                        v.actor = roles.find(r => r.id == v.role);
                        v.theme = tribeInfo && tribeInfo.theme;
                        return v;
                    })
                    const delMsgArr: Array<string> = [];
                    for (let value of msgb){
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
                        if ( index > -1) {
                            const msg = messagesCopy[index]
                            if(value.timestamp >= msg.timestamp){
                                messagesCopy.splice(index, 1, value);
                            }else{
                                console.log("msg is outdated >",value, msg)
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
                tribeService.setCacheMsg(config.tribeId, messagesCopy, roles,groupIds)
            }catch (e){
                console.error(e);
            }finally {
                cb(messagesCopy)
                release()
                console.log("release ...")
            }
        })

    }
}

export const tribeService = new TribeService();