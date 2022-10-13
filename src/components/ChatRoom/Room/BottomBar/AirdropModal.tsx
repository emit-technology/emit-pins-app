import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,IonItem,
    IonIcon,
    IonLabel, IonInput,
    IonModal,
    IonText,
    IonTitle, IonRadioGroup, IonRadio,
    IonToolbar,useIonToast
} from "@ionic/react";
import {happyOutline, openOutline} from "ionicons/icons";
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

    const [present, dismiss] = useIonToast();

    const {
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible,
    } = usePopperTooltip({
        placement: "top-end",
        interactive: true,
        delayHide: 200,
        closeOnTriggerHidden: true,
        closeOnOutsideClick: true,
        followCursor: true,
        trigger: ['click', 'hover']
    });

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
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            window.open("https://assets.emit.technology")
                        }}><IonIcon src={openOutline}/>Assets</IonButton>
                    </IonButtons>
                    <IonTitle>Airdrop</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {/*<div style={{height: `${height}px`,borderRadius:12, display: "flex",justifyContent:"center"}}>*/}
                {/*    <ImageView url={url} width={width} height={height}/>*/}
                {/*    /!*<img src={url} style={{objectFit: 'cover', height: '100%', borderRadius: 12}}/>*!/*/}
                {/*</div>*/}

                <div style={{position: "relative"}}>
                    <div style={{padding: '12px 0'}}>

                        <IonLabel position="stacked"><b>Airdrop Type: </b></IonLabel>
                        <IonLabel>
                            {
                                //@ts-ignore
                                <IonRadioGroup value={AirdropType.Random} ref={airdropRef}>
                                    <IonRadio value={AirdropType.Random}/> Random &nbsp; <IonRadio value={AirdropType.Average}/> Average
                                </IonRadioGroup>
                            }
                        </IonLabel>
                    </div>
                    <div className={'common-title'} style={{padding: '12px 0'}}>Token</div>
                    <div>
                        <IonLabel className="ion-text-wrap" onClick={() => {
                            loadBalance().catch(e => console.log(e));
                        }}>
                            {factor && <FactorItem factor={factor}/>}
                            {!factor && <IonLabel><IonText>No Available Token</IonText></IonLabel>}
                        </IonLabel>
                    </div>

                    <div className={'common-title'} style={{padding: '12px 0'}}>Amount</div>
                    <div>
                        {
                            //@ts-ignore
                            <IonInput placeholder="0.000" ref={amountRef} className="msg-input amount-input" inputmode="decimal"/>
                        }
                    </div>

                    <div className={'common-title'} style={{padding: '12px 0'}}>Title</div>
                    <div style={{position: "relative"}}>
                        {//@ts-ignore
                            <TextareaAutosize autoFocus ref={textRef} className="msg-input"/>
                        }
                        {/*<div style={{position: "absolute", right: "12px", bottom: "4px", zIndex: 1}}>*/}
                        {/*    <IonIcon className="footer-icon" src={happyOutline} color="primary" ref={setTriggerRef}*/}
                        {/*             size="large"/>*/}
                        {/*    {visible && (*/}
                        {/*        <div*/}
                        {/*            style={{zIndex: 10000000}}*/}
                        {/*            ref={setTooltipRef}*/}
                        {/*            {...getTooltipProps({className: 'tooltip-container'})}*/}
                        {/*        >*/}
                        {/*            <EmojiBlock onSelectEmoji={(v) => {*/}
                        {/*                if (textRef && textRef.current) {*/}
                        {/*                    //@ts-ignore*/}
                        {/*                    textRef.current.value = textRef.current.value + v.emoji*/}
                        {/*                }*/}
                        {/*            }}/>*/}
                        {/*        </div>*/}
                        {/*    )}*/}
                        {/*</div>*/}
                    </div>
                    <div className={'common-title'} style={{padding: '12px 0'}}>Content</div>
                    <div style={{position: "relative"}}>
                        {//@ts-ignore
                            <TextareaAutosize autoFocus ref={contentRef} className="msg-input"/>
                        }
                    </div>

                </div>

                <div style={{padding: '12px',width:'100%'}}>
                    <IonButton expand="block" size="small" onClick={() => {
                        sendAirdrop().then(()=>{
                            onClose();
                        }).catch(e=>{
                            const err = typeof e =='string'?e:e.message;
                            present({message: err,color:"danger",duration: 2000,position: "top"}).catch(e=>console.error(e))
                        })
                    }}>Send</IonButton>
                </div>

                <Balance isOpen={showBalance} onSelect={(factor) => {
                    setFactor(factor);
                    setShowBalance(false);
                }} factors={factors} onClose={() => setShowBalance(false)}/>
            </IonContent>
        </IonModal>
    </>
}