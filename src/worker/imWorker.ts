import service from 'imWorker/src/index';
import {PinnedSticky, WsStatus} from "../types";
import {tribeService} from "../service/tribe";
import selfStorage from "../common/storage";
import {emitBoxSdk} from "../service/emitBox";

class ImWorker {

    constructor() {

    }

    async init(tribeId:string){
        // const authToken = await tribeService.userCheckAuth()
        const authToken = selfStorage.getItem("authToken");
        return new Promise((resolve, reject)=>{
            service.init(tribeId,authToken,function (data:any){
                if(data.error){
                    reject(data.error);
                }else{
                    resolve(data.result);
                }
            })
        })
    }

    async checkAlive(tribeId:string):Promise<WsStatus>{
        let authToken = selfStorage.getItem("authToken");
        const accountLocal = await emitBoxSdk.getAccount();
        if(!accountLocal){
            return WsStatus.tokenInvalid;
        }
        if(!authToken){
            authToken = await tribeService.userCheckAuth()
        }
        return new Promise((resolve, reject)=>{
            service.checkAlive(tribeId,authToken,function (data:any){
                if(data.error){
                    reject(data.error);
                }else{
                    resolve(data.result);
                }
            })
        })
    }

    async getPinnedMessageArray(tribeId: string, pageNo:number,pageSize:number,conditions?:Array<any>):Promise<{data: Array<PinnedSticky>, total: number}> {
        return new Promise((resolve, reject)=>{
            service.getPinnedMessageArray(tribeId,pageNo,pageSize,conditions?conditions:[],function (data:any){
                if(data.error){
                    reject(data.error);
                }else{
                    resolve(data.result);
                }
            })
        })
    }

    addMessageListener(tribeId: string, cb:Function) {
        service.addMessageListener(tribeId,function (data:any){
           cb(data.result)
        })
    }

}

const tribeWorker = new ImWorker();
export default tribeWorker