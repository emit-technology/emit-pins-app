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
    IonToolbar, IonTextarea,
    IonCol, IonItem, IonCheckbox, IonLabel, IonRow, useIonToast, IonLoading
} from "@ionic/react";
import {happyOutline} from "ionicons/icons";
import {usePopperTooltip} from "react-popper-tooltip";
import {EmojiBlock} from "../../../Emojis/block";
import {ImageView} from "../../../utils/ImageView";
import UploadImage from "../../../utils/UploadImage";
import {useState} from "react";
import {tribeService} from "../../../../service/tribe";
import {ImageType, MessageType, MsgText, MsgTextImage, TribeRole} from "../../../../types";
import config from "../../../../common/config";
import add from "../../../../img/add.png";

interface Props {
    onOk: () => void;
    onClose: () => void;
    isOpen: boolean;
    selectRole: TribeRole
    // width: number;
    // height: number;
}

export const SendImageModal: React.FC<Props> = ({onOk, onClose, isOpen,selectRole}) => {

    const [file,setFile] = useState(null)
    const [img, setImg] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const [present] = useIonToast();

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

    const sendMsg = async (text: string) =>{
        if(!file){
            present({
                message: `Please upload an image!`,
                duration: 2000,
                position: "top",
                color: "danger"
            })
        }
        let imgRemote:MsgTextImage = img as MsgTextImage;
        if(file){
            imgRemote.url = await tribeService.uploadServer(file as File);
        }
        // const url =  tribeService.picDisplay(imageUrl, 100, 100);
        const obj = {image: imgRemote} as MsgText;
        if (text) {
            obj.content = text;
        }
        const contentData = `0x${Buffer.from(JSON.stringify(obj)).toString("hex")}`
        await tribeService.pushTribe({
            tribeId: config.tribeId,
            msgType: MessageType.Text,
            content: contentData,
            role: selectRole.id
        })
        setImg(null)
        setFile(null)
        onOk()
    }


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
                <div style={{borderRadius:12, display: "flex",justifyContent:"center"}}>
                    <UploadImage imgUrl={img && img["url"]} maxHeight={300}  defaultIcon={add} width="100%" setImgUrl={(data,width, height, file)=>{
                        setImg({url: data.data_url, width: width, height: height});
                        setFile(file)
                    }}/>
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
                    <IonButton size="small" disabled={!file} onClick={()=>{
                        //@ts-ignore
                        const text = textRef && textRef.current ?textRef.current.value: ""
                        setIsLoading(true);
                        sendMsg(text).then(()=>{
                            setIsLoading(false);
                        }).catch(e=> {
                            setIsLoading(false);
                            console.log(e)
                            const err = typeof e == 'string' ? e : e.message;
                            present({
                                message: err,
                                duration: 2000,
                                position: "top",
                                color: "danger"
                            })
                        })
                    }}>Send</IonButton>
                </div>

                <IonLoading
                    cssClass='my-custom-class'
                    isOpen={isLoading}
                    onDidDismiss={() => setIsLoading(false)}
                    message={'Please wait...'}
                    duration={60000}
                />

            </IonContent>
        </IonModal>
    </>
}