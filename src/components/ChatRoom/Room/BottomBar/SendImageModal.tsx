import * as React from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonCardTitle,
    IonCard,
    IonCardContent,
    IonInput,
    IonCardHeader,
    IonIcon,
    IonModal,
    IonTitle,
    IonToolbar,IonTextarea,
    IonCol, IonItem, IonCheckbox, IonLabel, IonRow
} from "@ionic/react";
import {happyOutline} from "ionicons/icons";
import {usePopperTooltip} from "react-popper-tooltip";
import {EmojiBlock} from "../../../Emojis/block";
import {ImageView} from "../../../utils/ImageView";

interface Props {
    url: string;
    onOk: (text: string) => void;
    onClose: () => void;
    isOpen: boolean;
    width: number;
    height: number;
}

export const SendImageModal: React.FC<Props> = ({url, onOk, onClose, isOpen,width,height}) => {
    const textRef = React.createRef();
    const {
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible,
    } = usePopperTooltip({
        placement: "bottom-end",
        interactive: true,
        delayHide: 200,
        closeOnTriggerHidden: true,
        closeOnOutsideClick: true,
        followCursor: true,
        trigger:['click','hover']
    });
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal" canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>Send image</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{height: `${height}px`,borderRadius:12, display: "flex",justifyContent:"center"}}>
                    <ImageView url={url} width={width} height={height}/>
                    {/*<img src={url} style={{objectFit: 'cover', height: '100%', borderRadius: 12}}/>*/}
                </div>

                <div style={{position: "relative"}}>
                    <IonItem>
                        <IonLabel position="stacked">Comment</IonLabel>
                        {//@ts-ignore
                            <IonTextarea autoFocus ref={textRef} onIonChange={(e)=>{
                                if(e.detail.value && e.detail.value.indexOf("/mind") == 0){
                                    //@ts-ignore
                                    if(textRef.current){
                                        //@ts-ignore
                                        textRef.current.value = textRef.current.value.replace("/mind","💭");
                                    }
                                }}
                            }/>
                        }

                    </IonItem>
                    <div style={{position:"absolute",right: "12px",bottom: "4px",zIndex: 1}}>
                        <IonIcon className="footer-icon" src={happyOutline} color="primary" ref={setTriggerRef} size="large"
                        />
                        {visible && (
                            <div
                                style={{zIndex: 10000000}}
                                ref={setTooltipRef}
                                {...getTooltipProps({className: 'tooltip-container'})}
                            >
                                <EmojiBlock onSelectEmoji={(v) => {
                                    if (textRef && textRef.current) {
                                        //@ts-ignore
                                        textRef.current.value = textRef.current.value + v.emoji
                                    }
                                }}/>
                                {/*<div {...getArrowProps({ className: 'tooltip-arrow' })} />*/}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{display: 'flex',padding:'12px', flexDirection: 'row' ,justifyContent: "flex-end"}}>
                    <IonButton size="small" onClick={()=>{
                        //@ts-ignore
                        const text = textRef && textRef.current ?textRef.current.value: ""
                        onOk(text)
                    }}>Send</IonButton>
                </div>
            </IonContent>
        </IonModal>
    </>
}