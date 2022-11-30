import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
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

    stickyMsg?: PinnedSticky

    onChangeMsgIndex?: (msgIndex:number)=>void;
}
const TribeHeaderChild:React.FC<Props> = ({tribeInfo,onReladData,onChangeMsgIndex,stickyMsg,roles,wsStatus}) =>{

    const [showTribeInfoModal,setShowTribeInfoModal] = useState(false);
    const [stickies,setStickies] = useState({data:[],total:0});

    const onClickTheme = useCallback(()=>{
        if(stickyMsg && !!onChangeMsgIndex){
            const index = tribeService.groupIdCache().findIndex(v=> v == stickyMsg.groupId)
            if(index> 0){
                tribeService.getMsgPositionWithGroupId(tribeService.groupIdCache()[index-1]).then(postion=>{
                    onChangeMsgIndex(postion)
                })
            }
        }
    },[stickyMsg])


    const onClickThemeForward = useCallback(()=>{
        if(stickyMsg && !!onChangeMsgIndex){
            const index = tribeService.groupIdCache().findIndex(v=> v == stickyMsg.groupId)
            if(index < tribeService.groupIdCache().length - 1){
                tribeService.getMsgPositionWithGroupId(tribeService.groupIdCache()[index+1]).then(postion=>{
                    onChangeMsgIndex(postion)
                })
            }
        }
    },[stickyMsg])

    const fetch = async ()=>{
        if(tribeInfo){
            if(!stickyMsg || !stickyMsg.groupId){
                const rest =  await tribeWorker.getPinnedMessageArray(config.tribeId,tribeService.getGroupStatic().total - tribeService.getGroupStatic().groupNum.find(v=>v.groupId == "").num, 100000)
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
        {
            stickyMsg && <div className="head-item">
                <div style={{cursor:"pointer"}}>
                    <IonItem lines="none">
                        {
                            stickyMsg && tribeService.groupIdCache().indexOf(stickyMsg.groupId)>0
                            && <IonIcon src={chevronBackOutline} slot="start" color="medium" onClick={onClickTheme}/>
                        }
                        <div style={{height: 42, width: 42, borderRadius: 6}} slot={"start"}  onClick={()=>{
                            fetch().then(()=>{
                                setShowTribeInfoModal(true)
                            }).catch(e=>console.error(e))
                        }}>
                            {
                                (stickyMsg && stickyMsg.theme.image || tribeInfo && tribeInfo.theme )
                                && <img width="100%" height="100%" src={utils.getDisPlayUrl(stickyMsg && stickyMsg.groupId ? stickyMsg.theme.image: tribeInfo && utils.getDisPlayUrl(tribeInfo.theme.image))}
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
                            stickyMsg && tribeService.groupIdCache().indexOf(stickyMsg.groupId) < tribeService.groupIdCache().length-1
                            &&  <IonIcon src={chevronForwardOutline} slot="end" color="medium" onClick={onClickThemeForward}/>
                        }

                    </IonItem>
                </div>
            </div>
        }

        <TribeInfoModal onReladData={onReladData} isOpen={showTribeInfoModal} stickies={stickies} onClose={()=>setShowTribeInfoModal(false)} tribeInfo={tribeInfo} roles={roles} stickyMsg={stickyMsg}/>
    </>
}

export const TribeHeader = React.memo(TribeHeaderChild)