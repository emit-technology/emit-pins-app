import * as React from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonLabel,
    IonItemDivider,
    IonItem,
    IonChip,
    IonBadge,
    IonModal,
    IonTitle,
    IonToolbar,
    IonFab, IonIcon
} from "@ionic/react";
import {FactorItem} from "./Factor";
import {Factor} from "@emit-technology/emit-lib";
import {utils} from "../../common";
import {closeCircleOutline, closeOutline, linkOutline, openOutline, walletOutline} from "ionicons/icons";
import {NoneData} from "../Data/None";

interface Props {
    isOpen: boolean;
    onSelect: (factor: Factor) => void;
    factors: Array<Factor>;
    onClose: ()=>void;
}

export const Balance: React.FC<Props> = ({isOpen, onSelect, factors,onClose}) => {

    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]} swipeToClose>
            <IonHeader collapse="fade">
                <IonToolbar>
                    {
                        !utils.useInjectAccount() && <IonButtons slot="start">
                            <IonButton onClick={() => {
                                window.open(utils.assetUrl())
                            }}><IonIcon src={openOutline}/>Assets</IonButton>
                        </IonButtons>
                    }
                    <IonTitle>EMIT Balance</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {
                    factors && factors.length>0 ? <>
                        {/*<IonItem>*/}
                        {/*    <IonLabel>*/}
                        {/*        Token*/}
                        {/*    </IonLabel>*/}
                        {/*    <IonLabel color="primary" slot="end">Balance</IonLabel>*/}
                        {/*</IonItem>*/}
                        {
                            factors && factors.map((v,i)=>{
                                return <div key={i} onClick={()=>onSelect(v)}>
                                    <FactorItem factor={v} showLine/>
                                </div>
                            })
                        }
                    </>:<>
                        <NoneData/>
                    </>
                }

            </IonContent>
        </IonModal>
    </>
}