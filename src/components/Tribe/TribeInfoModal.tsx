import * as React from 'react';
import {IonButton, IonButtons, IonIcon,IonContent,IonItem,IonLabel,IonRow,IonCol,IonAvatar,IonText, IonHeader, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import { PinnedSticky, TribeInfo, TribeRole} from "../../types";
import {ThemeItem} from "../Role/ThemeItem";
import {useEffect, useState} from "react";
import {MessageContentVisual} from "../ChatRoom/Room/Message";
import config from "../../common/config";
import {createOutline, gitBranchOutline, openOutline} from "ionicons/icons";
import {tribeService} from "../../service/tribe";
import {TribeEditModal} from "./TribeEditModal";
import {emitBoxSdk} from "../../service/emitBox";
import {ChainType} from "@emit-technology/emit-lib";
import {utils} from "../../common";

interface Props{
    isOpen: boolean;
    onClose:()=>void;
    tribeInfo: TribeInfo;
    roles: Array<TribeRole>;
    stickyMsg: PinnedSticky
    stickies: {
        data:Array<PinnedSticky>,
        total:number
    };
    onReladData?:()=>void;
}
export const TribeInfoModal:React.FC<Props> = ({isOpen,stickies,onReladData,onClose,tribeInfo,roles,stickyMsg,}) =>{

    const [owner, setOwner] = useState("")

    useEffect(()=>{
        emitBoxSdk.getAccount().then(act=>{
            setOwner(act && act.addresses[ChainType.EMIT])
        })
    },[])

    const [updateTribeModal,setUpdateTribeModal] = useState(false);

    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal">
            <IonHeader collapse="fade">
                <IonToolbar>
                    {
                        stickyMsg&&stickyMsg.groupId ?<div></div>
                        //     <IonButtons slot="start">
                        //     <IonButton onClick={() => {
                        //         tribeService.forkTribe(config.tribeId,stickyMsg.groupId,tribeInfo).then((tribeId)=>{
                        //             // window.open(`./${tribeId}`)
                        //             window.location.href = `./${tribeId}`;
                        //
                        //         }).catch(e=>{
                        //             console.error(e)
                        //         })
                        //     } }><IonIcon src={gitBranchOutline}/>Fork</IonButton>
                        // </IonButtons>
                            :
                            tribeInfo && tribeInfo.keeper == owner && <IonButtons slot="start">
                                <IonButton onClick={() => {
                                    setUpdateTribeModal(true);
                                } }>Update</IonButton>
                            </IonButtons>
                    }
                    <IonTitle>
                        <div style={{paddingTop: '3px'}}>
                            {tribeInfo && tribeInfo.title}
                            {
                                tribeInfo && tribeInfo.forked  && tribeInfo.forked.length>0 && <div>
                                    <IonText color="medium"><small style={{fontWeight:700}}>Forked from {tribeInfo.forked[0].tribeId}</small></IonText>
                                    <IonIcon style={{transform:'translateY(3px)',cursor:'pointer'}} size="small" src={openOutline} color="medium" onClick={()=>{
                                        utils.goTo(tribeInfo.forked[0].tribeId)
                                    }}/>
                                </div>
                            }
                        </div>
                        {/*<div >{tribeInfo && tribeInfo.title}</div>*/}
                        {/*<div style={{overflow: "hidden"}} >*/}
                        {/*    <span style={{fontSize: '11px'}}>*/}
                        {/*        <IonText color="medium">*/}
                        {/*            {stickyMsg && stickyMsg.groupId?`Pinned #${stickyMsg.seq}`: tribeInfo && tribeInfo.theme.themeTag}*/}
                        {/*        </IonText>*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">

                {
                    stickyMsg && <ThemeItem theme={stickyMsg.groupId? stickyMsg.theme: tribeInfo && tribeInfo.theme} roles={stickyMsg.groupId ?stickyMsg.roles:roles} seq={stickyMsg&&stickyMsg.groupId?stickyMsg.seq:0}/>
                }

                <div style={{padding: "0 12px"}}>
                    {
                        stickyMsg && stickyMsg.groupId ?
                            <div className="theme-pinned-box">
                                <div>{stickyMsg && stickyMsg.theme.themeTag}</div>
                                <div className="text-pre">
                                    {stickyMsg && stickyMsg.theme.themeDesc}
                                </div>
                            </div>:
                            <div className="theme-pinned-box">
                                <div>{tribeInfo && tribeInfo.theme.themeTag}</div>
                                <div className="text-pre">
                                    {tribeInfo && tribeInfo.theme.themeDesc}
                                </div>
                            </div>
                    }
                </div>

                <div className="tribe-info-modal-box">
                    <MessageContentVisual tribeInfo={tribeInfo} owner={""} pinnedStickies={stickies}/>
                </div>

                <TribeEditModal isOpen={updateTribeModal}
                                onClose={() => setUpdateTribeModal(false)}
                                onOk={(tribeId) => {
                                    setUpdateTribeModal(false);
                                    onReladData();
                                }} tribeInfo={tribeInfo}/>
            </IonContent>
        </IonModal>
    </>
}