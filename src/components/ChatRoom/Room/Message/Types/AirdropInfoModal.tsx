import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,IonItem,
    IonTitle,IonItemDivider,
    IonToolbar,
    IonBadge, IonLabel, IonRadioGroup, IonRadio, IonText, IonInput
} from "@ionic/react";
import {AirdropContent, AirdropInfo, AirdropType, Message} from "../../../../../types";
import {tribeService} from "../../../../../service/tribe";
import {utils} from "../../../../../common";
import {Text} from "./Text";
import {FactorItem} from "../../../../Assets";
import {NoneData} from "../../../../Data/None";
import TextareaAutosize from "react-textarea-autosize";

interface Props {
    onClose: () => void;
    isOpen: boolean;

    msg: Message;

    airdropRecord: Array<AirdropInfo>;
}

export const AirdropInfoModal: React.FC<Props> = ({onClose, isOpen,airdropRecord,msg}) => {

    const content = msg && msg.content as AirdropContent;
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal">
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>Airdrop Info</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {/*<div>*/}
                {/*    {msg && <Text msg={msg} showPin={false} owner={""}/>}*/}
                {/*</div>*/}
                <IonItemDivider>Info</IonItemDivider>
                <div style={{border: "1px solid #ddd",borderRadius: '0 0 8px 8px',marginBottom: 20}}>
                    <IonItem>
                        <IonLabel>Airdrop Type</IonLabel>
                        <IonLabel slot="end" className="ion-text-wrap">
                            { content && content.airdropType.toUpperCase() }
                        </IonLabel>
                    </IonItem>

                    <IonItem>
                        <IonLabel>Token</IonLabel>
                        <IonLabel slot="end" className="ion-text-wrap">{content && <IonBadge color="dark">{content.factor.category.symbol}&nbsp;[{utils.ellipsisStr(content.factor.category.supplier,3)}]</IonBadge>}</IonLabel>
                    </IonItem>

                    <IonItem>
                        <IonLabel>Amount</IonLabel>
                        <IonBadge slot="end" className="ion-text-wrap">{content && utils.fromValue(content.max,18).toString(10)}</IonBadge>
                    </IonItem>

                    <IonItem style={{position: "relative"}}>
                        <IonLabel>Title</IonLabel>
                        <IonLabel  slot="end"  className="ion-text-wrap"><b>{content && content.title}</b></IonLabel>
                    </IonItem>
                    <IonItem  lines="none">
                        <IonLabel>Content</IonLabel>
                        <IonLabel className="ion-text-wrap">{content && content.content}</IonLabel>
                    </IonItem>
                </div>
                <IonItemDivider>Record</IonItemDivider>
                <div style={{border: "1px solid #ddd",borderRadius: '0 0 8px 8px',overflow: "scroll",maxHeight:"42vh"}}>
                    {
                        airdropRecord && airdropRecord.length>0 ? (airdropRecord as Array<AirdropInfo>).map((v,i)=>{
                            return <div key={i} className="airdrop-record">
                                <div>{i+1}</div>
                                <div>{utils.ellipsisStr(v.user,3)}</div>
                                <div><b>{utils.fromHexValue(v.amount,18).toString(10)}</b></div>
                                <IonBadge color="dark">{content && content.factor && `${content.factor.category.symbol } ${utils.ellipsisStr(content.factor.category.supplier,3)}`}</IonBadge>
                            </div>
                        }):<div>
                            <NoneData desc={"No Record"}/>
                        </div>
                    }
                </div>
            </IonContent>
        </IonModal>
    </>
}