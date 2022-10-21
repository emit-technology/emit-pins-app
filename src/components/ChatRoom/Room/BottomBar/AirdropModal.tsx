import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader, IonItem,
    IonIcon,
    IonLabel, IonInput,
    IonModal,
    IonText, IonTextarea,
    IonTitle, IonRadioGroup, IonRadio,
    IonToolbar, useIonToast, IonRow, IonCol, IonBadge, IonLoading
} from "@ionic/react";
import {
    arrowForwardOutline,
    chevronDownOutline,
    chevronForwardOutline,
    closeOutline,
    happyOutline,
    openOutline
} from "ionicons/icons";
import {usePopperTooltip} from "react-popper-tooltip";
import {EmojiBlock} from "../../../Emojis/block";
import TextareaAutosize from 'react-textarea-autosize';
import {FactorItem} from "../../../Assets/Factor";
import {Balance} from "../../../Assets";
import {emitBoxSdk} from "../../../../service/emitBox";
import {ChainType, Factor} from "@emit-technology/emit-lib";
import {AirdropType, FunctionReq, TribeRole} from "../../../../types";
import config from "../../../../common/config";
import {utils} from "../../../../common";

interface Props {
    onOk: () => void;
    onClose: () => void;
    isOpen: boolean;
    actor: TribeRole
    owner: string;
}

export const AirdropModal: React.FC<Props> = ({onOk, actor, onClose, isOpen,owner}) => {
    const textRef = React.createRef();
    const amountRef = React.createRef();
    const airdropRef = React.createRef();
    const contentRef = React.createRef();
    const [factor, setFactor] = React.useState(null);
    const [factors, setFactors] = React.useState([]);
    const [showBalance, setShowBalance] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    const [present, dismiss] = useIonToast();

    useEffect(() => {
        init().catch(e => {
            console.error(e)
        })
    }, [owner])

    const init = async () => {
        const account = await emitBoxSdk.getAccount();
        if (account && account.addresses[ChainType.EMIT]) {
            const factors: Array<Factor> = await emitBoxSdk.emitBox.emitDataNode.getFactors(account.addresses[ChainType.EMIT]);
            setFactors(factors);
            setFactor(factors && factors.length > 0 ? factors[0] : null);
        }
    }

    const loadBalance = async () => {
        await init()
        setShowBalance(true)
    }

    const sendAirdrop = async () => {
        //@ts-ignore
        const title = textRef.current && textRef.current.value;
        //@ts-ignore
        const content = contentRef.current && contentRef.current.value;
        //@ts-ignore
        const amount = amountRef.current && amountRef.current.value;
        //@ts-ignore
        const airdropType = airdropRef.current && airdropRef.current.value;

        if(!factor){
            return Promise.reject("Please select token!");
        }
        if(!title){
            return Promise.reject("Please input title!");
        }
        if(!amount){
            return Promise.reject("Please input amount!");
        }

        const funReq: FunctionReq = {
            tribeId: config.tribeId,
            role: actor.id,
            title: title,
            max: utils.toValue(amount, 18).toString(10),
            content: content,
            airdropType: airdropType
        }
        const funReqText = JSON.stringify(funReq);
        const outData = JSON.stringify({Method: "airdrop", Param: Buffer.from(funReqText).toString("hex")});

        const rest = await emitBoxSdk.emitSend(config.airdropHandler, amount, factor as Factor, outData, []);

        setShowBalance(false);
    }
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal">
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Airdrop</IonTitle>
                    <IonButtons slot="end">
                        <IonIcon src={closeOutline} onClick={() => onClose()} size="large"/>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding modal-content" color="light">
                <div style={{position: "relative"}}>
                    <IonRow>
                        <IonCol><div className="balance-hd">
                            <div className="slskjs" onClick={()=>{
                                loadBalance().catch(e => console.log(e));
                            }}>
                                <IonBadge>{ factor ? `${utils.fromHex((factor as Factor).category.symbol)} [${utils.ellipsisStr((factor as Factor).category.supplier,3)}]` : "/"}  <IonIcon src={chevronDownOutline} style={{transform: "translateY(2px)"}}/></IonBadge>
                            </div>
                            <div className="blsl">
                                {factor && utils.fromHexValue((factor as Factor).value,18).toFixed(3) }
                                <div className="balance-text">Balance</div>
                            </div>
                        </div></IonCol>
                    </IonRow>

                    {/*<IonItem lines="none" className="item-ion">*/}
                    {/*    <IonLabel>Token</IonLabel>*/}
                    {/*    <IonLabel className="ion-text-wrap" slot="end" onClick={() => {*/}
                    {/*        loadBalance().catch(e => console.log(e));*/}
                    {/*    }}>*/}
                    {/*        {factor && `${utils.fromHex((factor as Factor).category.symbol)} [${utils.ellipsisStr((factor as Factor).category.supplier,3)}]`}*/}
                    {/*        {!factor && <IonButton>Select</IonButton>}*/}
                    {/*    </IonLabel>*/}
                    {/*    <IonIcon src={chevronForwardOutline} color="medium" slot="end"/>*/}
                    {/*</IonItem>*/}

                    <IonItem lines="none" className="item-ion">
                        <IonLabel>Amount</IonLabel>
                        {
                            //@ts-ignore
                            <IonInput placeholder="Enter amount" style={{textAlign: "right"}} slot="end" ref={amountRef}  inputmode="decimal"/>
                        }
                    </IonItem>


                    <IonItem lines="none" className="item-ion">
                        <IonLabel position="stacked">Title</IonLabel>
                        {
                            //@ts-ignore
                            <IonTextarea placeholder="Enter title"  ref={textRef}/>
                        }
                    </IonItem>

                    <IonItem lines="none" className="item-ion">
                        <IonLabel position="stacked">Content</IonLabel>
                        {
                            //@ts-ignore
                            <IonTextarea placeholder="Enter content" autoGrow rows={3}   ref={contentRef} />
                        }
                    </IonItem>

                </div>

                <div style={{padding: '12px',width:'100%'}}>
                    <IonButton expand="block" disabled={showLoading} onClick={() => {
                        setShowLoading(true)
                        sendAirdrop().then(()=>{
                            setShowLoading(false)
                            onClose();
                        }).catch(e=>{
                            setShowLoading(true)
                            const err = typeof e =='string'?e:e.message;
                            present({message: err,color:"danger",duration: 2000,position: "top"}).catch(e=>console.error(e))
                        })
                    }}>Send</IonButton>
                </div>

                <IonLoading
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    onDidDismiss={() => setShowLoading(false)}
                    message={'Loading...'}
                    duration={60000}
                />

                <Balance isOpen={showBalance} onSelect={(factor) => {
                    setFactor(factor);
                    setShowBalance(false);
                }} factors={factors} onClose={() => setShowBalance(false)}/>
            </IonContent>
        </IonModal>
    </>
}