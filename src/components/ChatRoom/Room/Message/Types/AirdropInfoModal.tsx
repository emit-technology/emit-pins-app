import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    IonButton,IonRow,IonCol,
    IonButtons,
    IonContent,
    IonHeader,IonAvatar,
    IonModal, IonItem,
    IonTitle, IonItemDivider,
    IonToolbar,
    IonBadge, IonLabel, IonRadioGroup, IonRadio, IonText, IonInput, IonIcon
} from "@ionic/react";
import {AirdropContent, AirdropInfo, AirdropType, Message} from "../../../../../types";
import {tribeService} from "../../../../../service/tribe";
import {utils} from "../../../../../common";
import {Text} from "./Text";
import {FactorItem} from "../../../../Assets";
import {NoneData} from "../../../../Data/None";
import TextareaAutosize from "react-textarea-autosize";
import {closeOutline} from "ionicons/icons";

interface Props {
    onClose: () => void;
    isOpen: boolean;

    msg: Message;

    airdropRecord: Array<AirdropInfo>;
    owner: string;
}

export const AirdropInfoModal: React.FC<Props> = ({onClose, isOpen,owner,airdropRecord,msg}) => {

    const content = msg && msg.content as AirdropContent;

    const _index = airdropRecord.findIndex(v=> v.user == owner);
    if(_index>-1){
        const _copy = JSON.parse(JSON.stringify(airdropRecord[_index]))
        airdropRecord.splice(_index,1);
        airdropRecord.unshift(_copy)
    }
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal">
            {/*<IonHeader>*/}
            {/*    <IonToolbar color="primary">*/}
            {/*        <IonTitle>Airdrop Info</IonTitle>*/}
            {/*        <IonButtons slot="end">*/}
            {/*            <IonIcon src={closeOutline} onClick={() => onClose()} size="large"/>*/}
            {/*        </IonButtons>*/}
            {/*    </IonToolbar>*/}
            {/*</IonHeader>*/}
            <IonContent className="modal-content" color="light">
                <div style={{position: "relative"}}>
                    <img src="./assets/img/airdrop-info-head.png"/>
                    <div className="balance-hd balance-db1">
                        <div style={{fontWeight: 700}}>
                            Airdrop
                        </div>
                        <div className="slskjs">
                            {content && <IonBadge color="secondary">{content.factor.category.symbol}&nbsp;[{utils.ellipsisStr(content.factor.category.supplier,3)}]</IonBadge>}
                        </div>
                        <div className="blsl">
                            {content && utils.fromValue(content.factor.value,18).toFixed(3)}
                            {/*<div className="balance-text">Balance</div>*/}
                        </div>
                        <div style={{width: 54, height: 54,background: "#fff",borderRadius:'50%',padding: 3}}>
                            <img style={{borderRadius:'50%'}} src={msg && msg.actor ?utils.getDisPlayUrl(msg.actor.avatar):"./assets/img/default-avatar.png"} width="100%" height="100%"/>
                        </div>

                        <div className="slwSS">
                            {content && content.title}
                        </div>

                    </div>
                    <div style={{position: "absolute", top: 0 ,right: 0,padding: '12px',color: '#fff'}} onClick={()=>{
                        onClose();
                    }}>
                        <IonIcon src={closeOutline} size="large"/>
                    </div>
                </div>

                <div style={{marginBottom: 20,padding: '0 12px 12px'}}>
                    <div style={{color: "#000",background:"#fff"}} className="ssowSdc text-pre  recmt-context">
                        {content && content.content}
                    </div>
                    {/*<div style={{fontSize:16,fontWeight:500,padding: '0 0 6px 12px'}}>Record</div>*/}
                    <div style={{borderRadius: '0 0 8px 8px',overflow: "scroll",maxHeight:"42vh"}}>
                        {
                            airdropRecord && airdropRecord.length>0 ? (airdropRecord as Array<AirdropInfo>).map((v,i)=>{
                                return <IonItem lines="none" color={owner == v.user ?"secondary":""} className="item-ion" key={i}>
                                    <IonAvatar slot="start">
                                        <img src={msg && msg.actor ?utils.getDisPlayUrl(msg.actor.avatar):"./assets/img/default-avatar.png"}/>
                                    </IonAvatar>
                                    <IonLabel className="ion-text-wrap">
                                        {msg && msg.actor && msg.actor.name? msg.actor.name:"Narrator"}
                                        <p>{utils.ellipsisStr(v.user)}</p>
                                    </IonLabel>
                                    <IonLabel slot="end">
                                        {utils.fromHexValue(v.amount,18).toFixed(3,1)}
                                    </IonLabel>
                                </IonItem>
                            }):<div>
                                <NoneData desc={"No Record"}/>
                            </div>
                        }
                    </div>
                </div>

            </IonContent>
        </IonModal>
    </>
}