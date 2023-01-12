import * as React from 'react';
import {IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import {CatItem} from "./Item";
import {CatInfo} from "../../types/cat";

interface Props {
    isOpen:boolean;
    onClose: ()=>void;
    catInfo: CatInfo;
}

export const CatInfoModal:React.FC<Props> = ({isOpen, onClose,catInfo}) =>{
    return <>

        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal" canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>YOUR CAT</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <CatItem catInfo={catInfo}/>
            </IonContent>
        </IonModal>
    </>
}