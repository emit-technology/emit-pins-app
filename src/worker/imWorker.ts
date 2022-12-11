import service from 'imWorker';
import {PinnedSticky, WsStatus} from "../types";
import {tribeService} from "../service/tribe";
import {emitBoxSdk} from "../service/emitBox";

class ImWorker {

    constructor() {

    }

    async init(tribeId:string){
        // const authToken = await tribeService.userCheckAuth()
        const authToken = tribeService.getAuthToken(); //selfStorage.getItem("authToken");
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
        let authToken = tribeService.getAuthToken();
        const accountLocal = await emitBoxSdk.getAccount();
        if(!accountLocal){
            return WsStatus.tokenInvalid;
        }
        if(!authToken){
            authToken = await tribeService.userCheckAuth()
        }
        return new Promise((resolve, reject)=>{
            service.checkAlive(tribeId,authToken,function (data:any){
                // console.log("======= check alive,", authToken, data )
                if(data.error){
                    reject(data.error);
                }else{
                    resolve(data.result);
                }
            })
        })
    }

    async logout():Promise<void> {
        return new Promise((resolve, reject)=>{
            service.logout(function (){
                resolve()
            })
        })
    }
    async getPinnedMessageArray(tribeId: string, current: number, limit: number, c?:any):Promise<{data: Array<PinnedSticky>, total: number}> {
        return new Promise((resolve, reject)=>{
            service.getPinnedMessageArray(tribeId,current, limit,function (data:any){
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