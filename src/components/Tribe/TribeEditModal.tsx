import * as React from 'react';
import {ImageType, MsgTextImage, TribeInfo, TribeRole} from "../../types";
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton, IonText,
    IonContent,
    IonTextarea,
    IonRow,
    IonCol, IonItemDivider,
    IonLoading, useIonToast, IonInput, IonIcon
} from '@ionic/react';
import UploadImage from "../utils/UploadImage";
import {useEffect, useState} from "react";
import {tribeService} from "../../service/tribe";
import add from "../../img/add.png";
import TextareaAutosize from "react-textarea-autosize";
import config from "../../common/config";
import {informationCircleOutline} from "ionicons/icons";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onOk: (tribeId: string) => void;

    tribeInfo?: TribeInfo

    forkGroupId?:string

}

export const TribeEditModal: React.FC<Props> = ({isOpen,forkGroupId, tribeInfo, onOk, onClose}) => {
    // const nullImage:ImageType = {url:"", width:0, height:0};
    const [imgUrl, setImgUrl] = useState(null);
    const [title, setTitle] = useState(tribeInfo && tribeInfo.title);
    const [desc, setDesc] = useState(tribeInfo && tribeInfo.desc);
    const [themeTag, setThemeTag] = useState(tribeInfo && tribeInfo.theme.themeTag);
    const [themeDesc, setThemeDesc] = useState(tribeInfo && tribeInfo.theme.themeDesc);
    const [background, setBackground] = useState(tribeInfo && tribeInfo.theme.backgroundColor);
    const [color, setColor] = useState(tribeInfo && tribeInfo.theme.color);
    const [showLoading, setShowLoading] = useState(false);
    const [present, dismiss] = useIonToast();

    useEffect(()=>{
        setTitle(tribeInfo && tribeInfo.title)
        setImgUrl(tribeInfo && tribeInfo.theme.image)
        setDesc(tribeInfo && tribeInfo.desc)
        setThemeDesc(tribeInfo && tribeInfo.theme.themeDesc)
        setThemeTag(tribeInfo && tribeInfo.theme.themeTag)
        setShowLoading(false)
    },[tribeInfo])

    const createTribe = async (): Promise<string> => {
        if(!imgUrl || !(imgUrl as MsgTextImage).url){
            present({message:"Please upload the image!", color: "danger", duration: 2000})
            return
        }
        if (tribeInfo) {
            let tribeId:string ;
            if(!forkGroupId){
                await tribeService.updateTribe({
                    tribeId: tribeInfo.tribeId,
                    image: imgUrl as ImageType,
                    color: color,
                    backgroundColor: background,
                    themeTag: themeTag,
                    themeDesc: themeDesc,
                    title: tribeInfo.title,
                    desc: themeDesc
                })
                tribeId = tribeInfo.tribeId;
            }else{
                const tribeInfoCopy:TribeInfo = JSON.parse(JSON.stringify(tribeInfo));
                tribeInfoCopy.theme = {
                    tribeId: tribeInfo.tribeId,
                    image: imgUrl as ImageType,
                    color: color,
                    backgroundColor: background,
                    themeTag: themeTag,
                    themeDesc: themeDesc,
                    title: tribeInfo.title,
                    desc: themeDesc
                };
                tribeId = await tribeService.forkTribe(config.tribeId,forkGroupId,tribeInfoCopy)
            }
            setTitle("")
            setImgUrl(null)
            setDesc("")
            setBackground("")
            setColor("")
            setShowLoading(false)
            setThemeDesc("")
            setThemeTag("")
            return tribeId;
        } else {
            const rest = await tribeService.creatTribe({
                title: title,
                desc: themeDesc,
                backgroundColor: background,
                color: color,
                image: imgUrl as ImageType,
                themeDesc: themeDesc,
                themeTag: title
            });
            setTitle("")
            setImgUrl(null)
            setThemeDesc("")
            setThemeTag("")
            setDesc("")
            setBackground("")
            setColor("")
            setShowLoading(false)
            return rest
        }
    }
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal">
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>{forkGroupId? `Create a new Fork  ${tribeInfo.title} `: (tribeInfo ? `Update ${tribeInfo.title}` : `Create Verse`)}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div >
                    <div style={{borderRadius: 14, padding: "0 22px"}}>

                        <div>
                            {
                                !tribeInfo?<>
                                    <div className='create-title'>Name</div>
                                    <div className='radius-6' style={{background: '#F1F3F5'}}>
                                        <IonInput value={title} placeholder="Name"
                                                  onIonChange={e => setTitle(e.detail.value!)}/>
                                    </div>
                                </>:<div className='create-title'></div>
                            }

                            {/*<div className='create-title'>Description</div>*/}
                            {/*<div color='medium' className='radius-6' style={{background: '#F1F3F5'}}>*/}
                            {/*    <IonTextarea className='common-input' rows={2}*/}
                            {/*                 value={desc} placeholder="Description"*/}
                            {/*                 onIonChange={e => setDesc(e.detail.value!)}/>*/}
                            {/*</div>*/}
                        </div>

                        {/*<IonItemDivider color="light">Theme</IonItemDivider>*/}
                        {
                            tribeInfo && <>
                                <div className='create-title'>Tag</div>
                                <div className='radius-6' style={{background: '#F1F3F5'}}>
                                    <IonInput value={themeTag} placeholder="Theme Tag"
                                              onIonChange={e => setThemeTag(e.detail.value!)}/>
                                </div>
                                {
                                    !!forkGroupId && <div className="fork-title">
                                        By default, forks are tag the same as their upstream verse. You can customize the tag to distinguish it further.
                                    </div>
                                }
                            </>
                        }

                        <div className='create-title'>Note</div>
                        <div color='medium' className='radius-6' style={{background: '#F1F3F5'}}>
                            {/*<IonTextarea className='common-input' rows={2}*/}
                            {/*             value={themeDesc} placeholder="Description"*/}
                            {/*             onIonChange={e => setThemeDesc(e.detail.value!)}/>*/}

                            <TextareaAutosize maxRows={3} rows={2} maxLength={1024} value={themeDesc} onChange={(e)=>{
                                setThemeDesc(e.target.value);
                            }}
                                               placeholder="Note" className="msg-input"/>
                        </div>


                        <div className='create-title'>Image</div>

                        <div className="tribe-info-img">
                            <UploadImage defaultIcon={add}  width='100%' imgUrl={imgUrl && imgUrl.url} setImgUrl={(url, width, height)=>setImgUrl({
                                url: url,height: height,width: width
                            })}
                                         setColor={(bg, font, badge, text) => {
                                             setBackground(bg);
                                             setColor(font);
                                         }}/>
                        </div>

                        {
                            !!forkGroupId && <div className="fork-title" style={{padding: "12px 0 0"}}>
                                <IonIcon src={informationCircleOutline} style={{transform: 'translateY(3px)'}}/> You are creating a fork in your personal account.<br/> A fork is a copy of a verse. Forking a pin allows you to freely experiment with changes without affecting the original verse.
                            </div>
                        }
                    </div>
                    <div className="modal-btn">
                        <IonRow>
                            <IonCol size="4">
                                <IonButton fill="outline" expand="block" onClick={() => onClose()}>Cancel</IonButton>
                            </IonCol>
                            <IonCol size="8">
                                <IonButton expand="block" disabled={showLoading} onClick={() => {
                                    setShowLoading(true)
                                    createTribe().then((tribeId: string) => {
                                        onOk(tribeId)
                                    }).catch(e => {
                                        setShowLoading(false)
                                        const err = typeof e == 'string' ? e : e.message;
                                        present({
                                            duration: 2000,
                                            buttons: [{text: 'Close', handler: () => dismiss()}],
                                            message: err,
                                            position: "top",
                                            color: "danger",
                                            onDidDismiss: () => console.log('dismissed'),
                                            onWillDismiss: () => console.log('will dismiss'),
                                        }).catch(e => {
                                            console.error(e)
                                        })
                                    })
                                }}>Ok</IonButton>
                            </IonCol>
                        </IonRow>
                    </div>
                </div>

                <IonLoading
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    onDidDismiss={() => setShowLoading(false)}
                    message={'Please wait...'}
                    duration={60000}
                />
            </IonContent>
        </IonModal>
    </>
}