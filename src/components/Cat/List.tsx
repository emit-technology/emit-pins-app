import * as React from 'react';
import {CatInfo} from "../../types/cat";
import {CatItem} from "./Item";
import {
    IonButton,
    IonRow,
    IonCol,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar, IonIcon
} from "@ionic/react";
import './index.scss';
import {closeOutline} from "ionicons/icons";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    items: Array<CatInfo>
}

export const CatList: React.FC<Props> = ({items, isOpen, onClose,}) => {
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-cat-modal" >
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>YOUR CAT</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}><IonIcon src={closeOutline}/></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {
                    items && items.length == 0 &&
                    <div className="cat-empty-content">
                        <div className="cat-empty-box" style={{backgroundImage: `url('./assets/img/icon/catDashRec.svg')`}}>
                            <div style={{marginBottom: 20}}>
                                Seems like you don’t have a cat yet.<br/>
                                Adopt one right now!
                            </div>
                            <IonButton size="small">Adopt</IonButton>
                        </div>
                    </div>
                }

                {
                    items && items.length > 0 &&
                    <IonRow>
                        {
                            items && items.map(v => {
                                return <IonCol sizeMd="6" size="12"><CatItem catInfo={v}/></IonCol>
                            })
                        }
                    </IonRow>
                }


            </IonContent>
        </IonModal>
    </>
}