import * as React from 'react';
import {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../../common/state/app/hooks";
import {saveDataState} from '../../common/state/slice/dataSlice';
import {IonIcon, IonItem, IonLabel, IonText} from "@ionic/react";
import {MessageStatus, PinnedSticky, TribeInfo, TribeRole, WsStatus} from "../../types";
import tribeWorker from "../../worker/imWorker";
import config from "../../common/config";
import {chevronBackOutline, chevronForwardOutline} from "ionicons/icons";
import BigNumber from "bignumber.js";
import {tribeService} from "../../service/tribe";
import {TribeInfoModal} from "./TribeInfoModal";
import {utils} from "../../common";

interface Props{
    tribeInfo: TribeInfo;
    roles:Array<TribeRole>;
    wsStatus: WsStatus;
    onReladData?:()=>void;
}
export const TribeHeader:React.FC<Props> = ({tribeInfo,onReladData,roles,wsStatus}) =>{
    const dispatchData = useAppSelector(state => state.jsonData);
    const dispatch = useAppDispatch();

    const [stickyMsg,setStickyMsg] = useState(null);

    const [showTribeInfoModal,setShowTribeInfoModal] = useState(false);
    const [stickies,setStickies] = useState({data:[],total:0});
    useEffect(()=>{
        if (dispatchData) {
            if (dispatchData.tag == 'updateTheme' && dispatchData.data) {
                let dataObj:any = dispatchData.data;
                if (dataObj.stickyMsgTop) {
                    setStickyMsg(dataObj.stickyMsgTop)
                    dispatch(saveDataState({data:  {stickyMsg: dataObj.stickyMsg, stickyMsgTop: null}, tag: 'updateTheme'}))
                }

            }
        }
    },[dispatchData.data])
    const fetch = async ()=>{
        console.log("stickyMsg", stickyMsg);

        if(tribeInfo){
            if(!stickyMsg || !stickyMsg.groupId){
                const rest =  await tribeWorker.getPinnedMessageArray(config.tribeId,1, 100000,[
                    "tribeIdAndGroupId",
                    [config.tribeId,""]
                    ,[config.tribeId,""]
                ])
                const data = rest.data.filter(v=>v.records && (v.records.length>0 && v.records[0].msgStatus !== MessageStatus.removed || v.records.length ==0));
                setStickies({data:data,total: data.length})
            }else{
                if(stickyMsg && stickyMsg.groupId) {
                    const rest = await tribeService.groupedMsgRemove([stickyMsg.groupId], true);

                    if (rest && rest.length > 0) {
                        const data = await tribeService.convertGroupMsgToPinnedSticky(rest)
                        if (data && data.length > 0) {
                            data[0].seq = stickyMsg.seq;
                        }
                        setStickies({data: data, total: data.length})
                    }
                }

            }

        }
    }
    return <>
        <div className="head-item">
            <div style={{cursor:"pointer"}}>
                <IonItem lines="none">
                    {
                        (stickyMsg && stickyMsg.groupId && stickyMsg.seq >1 || stickyMsg && !stickyMsg.groupId ) ? <IonIcon src={chevronBackOutline} slot="start" color="medium" onClick={()=>{
                                console.log("stickyMsg.seq - 1",stickyMsg, stickyMsg.seq - 1)
                                dispatch(saveDataState({data: JSON.stringify({forward: 1, refresh: stickyMsg.groupId ?new BigNumber(stickyMsg.seq).minus(1).toNumber(): 666666}), tag: 'scrollToItem'}))
                            }}/>:
                            <IonIcon src={chevronBackOutline} slot="start" style={{color:"#ffffff"}}/>
                    }
                    <div style={{height: 42, width: 42, borderRadius: 6}} slot={"start"}  onClick={()=>{
                        fetch().then(()=>{
                            setShowTribeInfoModal(true)
                        }).catch(e=>console.error(e))
                    }}>
                        {
                            (stickyMsg && stickyMsg.theme.image || tribeInfo && tribeInfo.theme ) && <img width="100%" height="100%" src={utils.getDisPlayUrl(stickyMsg && stickyMsg.groupId ? stickyMsg.theme.image: tribeInfo && utils.getDisPlayUrl(tribeInfo.theme.image))}
                                 style={{borderRadius: 6, objectFit:'cover'}}/>
                        }
                    </div>
                    <IonLabel className="ion-text-nowrap" onClick={()=>{
                        fetch().then(()=>{
                            setShowTribeInfoModal(true)
                        }).catch(e=>console.error(e))
                    }}>
                        <div className="head-pin-title">{tribeInfo && tribeInfo.title}</div>
                        <div style={{overflow: "hidden"}} className="head-sub">
                            <span style={{fontSize: '11px'}}>
                                <IonText color="medium">
                                    {
                                        (stickyMsg && stickyMsg.groupId?`#${stickyMsg.seq} ${(stickyMsg as PinnedSticky).theme.themeTag}`: tribeInfo && tribeInfo.theme.themeTag)
                                    }
                                </IonText>
                            </span>
                        </div>
                    </IonLabel>
                    {
                        (stickyMsg && stickyMsg.groupId && stickyMsg.seq > 0) ? <IonIcon src={chevronForwardOutline} slot="end" color="medium"  onClick={()=>{
                            console.log("stickyMsg.seq + 1",stickyMsg, stickyMsg.seq + 1);
                                dispatch(saveDataState({data: JSON.stringify({forward: 2,refresh: stickyMsg.groupId ? new BigNumber(stickyMsg.seq).plus(1).toNumber():888888}), tag: 'scrollToItem'}))
                            }}/>:
                            <IonIcon src={chevronForwardOutline} slot="end" style={{color:"#ffffff"}}/>
                    }

                </IonItem>
            </div>
        </div>

        <TribeInfoModal onReladData={onReladData} isOpen={showTribeInfoModal} stickies={stickies} onClose={()=>setShowTribeInfoModal(false)} tribeInfo={tribeInfo} roles={roles} stickyMsg={stickyMsg}/>
    </>
}