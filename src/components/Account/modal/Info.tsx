import * as React from 'react';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar} from "@ionic/react";

interface Props{
    isOpen: boolean;
    onOk: ()=>void;
    onClose: ()=>void;
}

export const AccountInfo:React.FC<Props> = ({isOpen, onClose,onOk})=>{

    return <>
        <IonModal isOpen={isOpen} className="role-select-list" onDidDismiss={() => {
            onClose()
        }}>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>Create Account</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">

            </IonContent>
        </IonModal>
    </>
}