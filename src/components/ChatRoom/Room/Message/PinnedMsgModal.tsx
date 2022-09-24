import * as React from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader, IonIcon,
    IonModal,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import {PinnedSticky, TribeInfo} from "../../../../types";
import {MessageContentVisual} from "./MessageVisual";
import {gitBranchOutline} from "ionicons/icons";
import {tribeService} from "../../../../service/tribe";
import config from "../../../../common/config";

interface Props{
    isOpen: boolean;
    onClose: ()=>void;
    data: {data:Array<PinnedSticky>, total: number};
    tribeInfo: TribeInfo
}
export const PinnedMsgModal: React.FC<Props> = ({isOpen,onClose,tribeInfo,data}) =>{
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()}>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                    <IonTitle>Pinned messages</IonTitle>
                    <IonButton size="small" slot="end" onClick={() => {
                        // tribeService.forkTribe(config.tribeId,data[0].groupId).then((tribeId)=>{
                        //     window.open(`./#/${tribeId}`)
                        // }).catch(e=>{
                        //     console.error(e)
                        // })
                    }}>
                        <IonIcon src={gitBranchOutline}/> FORK
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <MessageContentVisual pinnedStickies={data} tribeInfo={tribeInfo} owner={""}/>
            </IonContent>
        </IonModal>
    </>
}