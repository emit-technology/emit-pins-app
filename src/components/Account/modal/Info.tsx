import * as React from 'react';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import {closeOutline} from "ionicons/icons";

interface Props{
    isOpen: boolean;
    onOk: ()=>void;
    onClose: ()=>void;
}

export const AccountInfo:React.FC<Props> = ({isOpen, onClose,onOk})=>{

    return <>
        <IonModal isOpen={isOpen} className="role-select-list" onDidDismiss={() => {
            onClose()
        }} canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>Create Account</IonTitle>
                    <IonIcon src={closeOutline} size="large" onClick={()=>onClose()} slot="end"/>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">

            </IonContent>
        </IonModal>
    </>
}