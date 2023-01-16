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
import {url} from "inspector";
import {XBlock, XMasonry} from "react-xmasonry";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    items: Array<CatInfo>
}

export const CatList: React.FC<Props> = ({items, isOpen, onClose,}) => {
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-cat-modal" >
            {/*<IonHeader>*/}
            {/*    <IonToolbar>*/}
            {/*        <IonTitle>Noki</IonTitle>*/}
            {/*        <IonButtons slot="end">*/}
            {/*            <IonButton onClick={() => onClose()} style={{transform: "translateX(10px)"}}><IonIcon src={closeOutline} size="large"/></IonButton>*/}
            {/*        </IonButtons>*/}
            {/*    </IonToolbar>*/}
            {/*</IonHeader>*/}
            <IonContent className="ion-padding" color="tertiary">
               <div className="noki-box">
                   <div className="noki-title">
                       <div><img src="./assets/img/icon/catOutline.png"/></div>
                       <div>YOUR NOKI</div>
                   </div>
                   {
                       items && items.length == 0 &&
                       <div className="cat-empty-content">
                           <div className="cat-empty-box" style={{backgroundImage: `url('./assets/img/icon/catDashRec.svg')`}}>
                               <div style={{marginBottom: 20}}>
                                   Seems like you don’t have a noki yet.<br/>
                                   {/*Adopt one right now!*/}
                               </div>
                               {/*<IonButton size="small">Adopt</IonButton>*/}
                           </div>
                       </div>
                   }

                   {
                       items && items.length > 0 &&
                       <XMasonry>
                           {
                               items && items.map((v,i) => {
                                   return <XBlock key={i}>
                                       <CatItem catInfo={v}/>
                                   </XBlock>
                               })
                           }

                       </XMasonry>
                   }

                   <div style={{position: "absolute",top: 0, right:0}}>
                       <IonButtons slot="end">
                           <IonButton color="primary" onClick={() => onClose()} style={{transform: "translateX(10px)"}}><IonIcon src={closeOutline} size="large"/></IonButton>
                       </IonButtons>
                   </div>
               </div>
            </IonContent>
        </IonModal>
    </>
}