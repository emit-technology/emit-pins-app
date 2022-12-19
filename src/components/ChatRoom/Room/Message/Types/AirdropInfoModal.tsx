import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    IonContent,
    IonHeader,
    IonAvatar,
    IonModal,
    IonItem,
    IonBadge,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    IonText,
    IonInput,
    IonIcon,
    useIonToast,
    IonToolbar,
    IonTitle,
    IonButtons
} from "@ionic/react";
import {AirdropContent, AirdropInfo, AirdropType, Message} from "../../../../../types";
import {utils} from "../../../../../common";
import {NoneData} from "../../../../Data/None";
import {closeOutline, copyOutline, downloadOutline} from "ionicons/icons";
import copy from "copy-to-clipboard";

interface Props {
    onClose: () => void;
    isOpen: boolean;

    msg: Message;

    airdropRecord: Array<AirdropInfo>;
    owner: string;
    keeper: string;
}

export const AirdropInfoModal: React.FC<Props> = ({onClose, isOpen,keeper, owner, airdropRecord, msg}) => {

    const content = msg && msg.content as AirdropContent;

    const [present, dismiss] = useIonToast();
    const _index = airdropRecord.findIndex(v => v.user == owner);
    if (_index > -1) {
        const _copy = JSON.parse(JSON.stringify(airdropRecord[_index]))
        airdropRecord.splice(_index, 1);
        airdropRecord.unshift(_copy)
    }
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="airdrop-info-modal" canDismiss>
            {/*<IonHeader>*/}
            {/*    <IonToolbar color="primary">*/}
            {/*        <IonTitle>Airdrop</IonTitle>*/}
            {/*        <IonButtons slot="end">*/}
            {/*            <IonIcon src={closeOutline} onClick={() => onClose()} size="large"/>*/}
            {/*        </IonButtons>*/}
            {/*    </IonToolbar>*/}
            {/*</IonHeader>*/}
            <IonContent className="modal-content" color="light">
                <div style={{position: "relative"}}>
                    <img src="./assets/img/airdrop-info-head.png"/>
                    {
                        owner && (keeper && keeper == owner || owner == msg.owner) && airdropRecord && airdropRecord.length>0&& <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: '12px',
                            zIndex: 100,
                            color: '#fff'
                        }} onClick={() => {
                            const mgr = airdropRecord.map(v => `${v.user} , ${utils.fromHexValue(v.amount, 18).toFixed(3, 1)} , ${content && content.factor.category.symbol}`)
                            copy(mgr.join("\n"))
                            present({
                                message: "Copied to clipboard!",
                                position: "top",
                                color: "primary",
                                duration: 2000
                            })
                        }}>
                            <IonIcon src={copyOutline} size="large"/>&nbsp;<span>Records</span>
                        </div>
                    }
                    <div className="balance-hd balance-db1">
                        <div style={{fontWeight: 700}}>
                            Airdrop
                        </div>
                        <div className="slskjs">
                            {content && <IonBadge
                                color="secondary">{content.factor.category.symbol}&nbsp;[{utils.ellipsisStr(content.factor.category.supplier, 3)}]</IonBadge>}
                        </div>
                        <div className="blsl">
                            {content && utils.fromValue(content.factor.value, 18).toFixed(3)}
                            {/*<div className="balance-text">Balance</div>*/}
                        </div>
                        <div style={{width: 54, height: 54, background: "#fff", borderRadius: '50%', padding: 3}}>
                            <img style={{borderRadius: '50%'}}
                                 src={msg && msg.actor ? utils.getDisPlayUrl(msg.actor.avatar) : "./assets/img/default-avatar.png"}
                                 width="100%" height="100%"/>
                        </div>

                        <div className="slwSS">
                            {content && content.title}
                        </div>

                    </div>
                    <div style={{position: "absolute", top: 0, right: 0, padding: '12px', color: '#fff'}}
                         onClick={() => {
                             onClose();
                         }}>
                        <IonIcon src={closeOutline} size="large"/>
                    </div>

                </div>

                <div style={{margin: '30px 0 20px 0', padding: '0 12px 12px'}}>
                    <div style={{color: "#000", background: "#fff"}} className="ssowSdc text-pre  recmt-context">
                        {content && content.content}
                    </div>
                    {/*<div style={{fontSize:16,fontWeight:500,padding: '0 0 6px 12px'}}>Record</div>*/}
                    <div style={{borderRadius: '0 0 8px 8px', overflow: "scroll", maxHeight: "42vh"}}>
                        {
                            airdropRecord && airdropRecord.length > 0 ? (airdropRecord as Array<AirdropInfo>).map((v, i) => {
                                return <IonItem lines="none" color={owner == v.user ? "secondary" : ""}
                                                className="item-ion" key={i}>
                                    <IonAvatar slot="start">
                                        <img
                                            src={msg && msg.actor ? utils.getDisPlayUrl(msg.actor.avatar) : "./assets/img/default-avatar.png"}/>
                                    </IonAvatar>
                                    <IonLabel className="ion-text-wrap">
                                        {msg && msg.actor && msg.actor.name ? msg.actor.name : "Narrator"}
                                        <p>{utils.ellipsisStr(v.user)}</p>
                                    </IonLabel>
                                    <IonLabel slot="end">
                                        {utils.fromHexValue(v.amount, 18).toFixed(3, 1)}
                                    </IonLabel>
                                </IonItem>
                            }) : <div>
                                <NoneData desc={"No Record"}/>
                            </div>
                        }
                    </div>
                </div>

            </IonContent>
        </IonModal>
    </>
}