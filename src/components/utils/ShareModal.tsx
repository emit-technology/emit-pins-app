import * as React from 'react';
import {IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import {Message, TribeInfo} from "../../types";

interface Props{
    isOpen:boolean;
    onClose:()=>void;
    tribeInfo: TribeInfo;
    latestMessage: Array<Message>;
}
const ShareModal:React.FC<Props> = ({isOpen,onClose,tribeInfo,latestMessage})=>{

    return  <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal" canDismiss>
        <IonContent className="ion-padding">
            <div className="about-info">

            </div>
        </IonContent>
    </IonModal>
}