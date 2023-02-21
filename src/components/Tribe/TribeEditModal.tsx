import * as React from 'react';
import {ImageType, MsgTextImage, TribeInfo, TribeRole} from "../../types";
import {
    IonModal,
    IonHeader,
    IonLabel,IonItem,
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
import {useCallback, useEffect, useState} from "react";
import {tribeService} from "../../service/tribe";
import add from "../../img/add.png";
import TextareaAutosize from "react-textarea-autosize";
import config from "../../common/config";
import {closeOutline, informationCircleOutline} from "ionicons/icons";
import {saveDataState} from "../../common/state/slice/dataSlice";
import {useAppDispatch} from "../../common/state/app/hooks";
import {saveMessageState} from "../../common/state/slice/messageSlice";
import {ImageView} from "../utils/ImageView";

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
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState(tribeInfo && tribeInfo.title);
    const [desc, setDesc] = useState(tribeInfo && tribeInfo.desc);
    const [themeTag, setThemeTag] = useState(tribeInfo && tribeInfo.theme.themeTag);
    const [themeDesc, setThemeDesc] = useState(tribeInfo && tribeInfo.theme.themeDesc);
    const [background, setBackground] = useState(tribeInfo && tribeInfo.theme.backgroundColor);
    const [color, setColor] = useState(tribeInfo && tribeInfo.theme.color);
    const [showLoading, setShowLoading] = useState(false);
    const [present, dismiss] = useIonToast();
    const dispatch = useAppDispatch();

    useEffect(()=>{
        setTitle(tribeInfo && tribeInfo.title)
        setImgUrl(tribeInfo && tribeInfo.theme.image)
        setDesc(tribeInfo && tribeInfo.desc)
        setThemeDesc(tribeInfo && tribeInfo.theme.themeDesc)
        setThemeTag(tribeInfo && tribeInfo.theme.themeTag)
        setShowLoading(false)
    },[tribeInfo])

    const createTribe = async (): Promise<string> => {

        if(!forkGroupId){
            if(!imgUrl || !(imgUrl as MsgTextImage).url){
                return Promise.reject("Please upload the image! ")
            }
            if(title && (title.indexOf("http://") > -1 || title.indexOf("https:") > -1) ) {
                return Promise.reject("Can't set url in the name !")
            }
            if(themeTag && (themeTag.indexOf("http://") > -1 || themeTag.indexOf("https:") > -1) ){
                return Promise.reject("Can't set url in the Note !")
            }
        }
        let imageRemote = imgUrl;
        if(file){
            imageRemote["url"] = await tribeService.uploadServer(file as File)
        }

        if (tribeInfo) {
            let tribeId:string ;

            if(!forkGroupId){
                const newTheme = JSON.parse(JSON.stringify(tribeInfo.theme))
                await tribeService.updateTribe({
                    tribeId: tribeInfo.tribeId,
                    image: imageRemote as ImageType,
                    color: color,
                    backgroundColor: background,
                    themeTag: themeTag,
                    themeDesc: themeDesc,
                    title: tribeInfo && tribeInfo.title,
                    desc: themeDesc
                })
                tribeId = tribeInfo.tribeId;

                newTheme.image = imageRemote as ImageType;
                const stickyMsg = {
                    theme: newTheme,
                    seq: -1,
                    roles: [],
                    records: [],
                    groupId: "",
                    index: -1
                }
                dispatch(saveDataState({
                    data: {time: Date.now()},
                    tag: 'initTribeInfo'
                }))

                setTimeout(()=>{
                    console.log("update sticky msg ", stickyMsg)
                    dispatch(saveDataState({
                        data: {stickyMsg: stickyMsg, time: Date.now()},
                        tag: 'updateThemeRight'
                    }))
                    dispatch(saveMessageState({
                        data: {stickyMsg: stickyMsg, time: Date.now()},
                        tag: 'updateThemeHead'
                    }))
                }, 100)
            }else{
                if(title && (title.indexOf("http://") > -1 || title.indexOf("https:") > -1) ) {
                    return Promise.reject("Can't set url in the name !")
                }
                const tribeInfoCopy:TribeInfo = JSON.parse(JSON.stringify(tribeInfo));
                tribeInfoCopy.theme = {
                    tribeId: tribeInfo.tribeId,
                    image: imageRemote as ImageType,
                    color: color,
                    backgroundColor: background,
                    themeTag: themeTag,
                    themeDesc: themeDesc,
                    title: title,
                    desc: themeDesc
                };
                tribeId = await tribeService.forkTribe(config.tribeId,forkGroupId,tribeInfoCopy)
            }
            setTitle("")
            setFile(null)
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
                image: imageRemote as ImageType,
                themeDesc: themeDesc,
                themeTag: title
            });
            setTitle("")
            setFile(null)
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
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-edit-modal" canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>{forkGroupId? `Fork the Verse - ${tribeInfo && tribeInfo.title} `: (tribeInfo ? `Update ${tribeInfo.title}` : `Create Verse`)}</IonTitle>
                    <IonButtons slot="end">
                        <IonIcon src={closeOutline} size="large" onClick={()=>onClose()}/>
                        {/*<IonButton onClick={() => onClose()}>Close</IonButton>*/}
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

                        {
                            !!forkGroupId && <div>
                                <div className='create-title'>Name</div>
                                <div className='radius-6' style={{background: '#F1F3F5'}}>
                                    <IonInput value={tribeInfo && title} placeholder="Verse Name"
                                              onIonChange={e => setTitle(e.detail.value!)}/>
                                </div>
                                {/*{*/}
                                {/*    !!forkGroupId && <div className="fork-title">*/}
                                {/*        /!*By default, forks are named the same as their upstream verse. You can customize the name to distinguish it further.*!/*/}
                                {/*        */}
                                {/*    </div>*/}
                                {/*}*/}
                            </div>
                        }
                        {
                            !forkGroupId && <>
                                {/*<IonItemDivider color="light">Theme</IonItemDivider>*/}
                                {
                                    tribeInfo && <>
                                        <div className='create-title'>Tag</div>
                                        <div className='radius-6' style={{background: '#F1F3F5'}}>
                                            <IonInput value={themeTag} placeholder="Theme Tag"
                                                      onIonChange={e => setThemeTag(e.detail.value!)}/>
                                        </div>
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
                                                      placeholder="Note" className="msg-input2"/>
                                </div>


                                <div className='create-title'>Image</div>

                                <div className="tribe-info-img">
                                    <UploadImage maxHeight={300} defaultIcon={add}  width='100%' imgUrl={imgUrl && imgUrl.url} setImgUrl={(data, width, height, file)=>{
                                        if(!data.data_url){
                                            setImgUrl(null)
                                            setFile(null)
                                        }else{
                                            setImgUrl({
                                                url: data.data_url,height: height,width: width
                                            })
                                            setFile(file);
                                        }
                                    }}
                                                 setColor={(bg, font, badge, text) => {
                                                     setBackground(bg);
                                                     setColor(font);
                                                 }}/>
                                </div>
                            </>
                        }

                        {
                            !!forkGroupId && <div className="fork-title" style={{padding: "12px 0 0"}}>
                                <div className="fork-decs">
                                    <div className="create-title">Pos</div>
                                    <div><IonText color="primary">#{tribeService.getGroupIds().indexOf(forkGroupId) + 1}</IonText></div>
                                </div>

                                <div className="fork-decs">
                                    <div className="create-title">Tag</div>
                                    <div className="text-pre" style={{padding: "0 0 0 12px"}}>
                                        <IonText color="primary">{themeTag}</IonText>
                                    </div>
                                </div>

                                <div className="create-title" style={{marginTop: 6}}>Photo</div>
                                <div style={{display: "flex", justifyContent: "center",marginTop: 12}}>
                                    {
                                        imgUrl && <ImageView url={(imgUrl as MsgTextImage).url} width={(imgUrl as MsgTextImage).width} height={(imgUrl as MsgTextImage).height}/>
                                    }
                                </div>
                            </div>
                        }



                    </div>
                    <div className="modal-btn">
                        <IonRow>
                            <IonCol size="4">
                                <IonButton  className="btn-common" fill="outline" expand="block" onClick={() => onClose()}>Cancel</IonButton>
                            </IonCol>
                            <IonCol size="8">
                                <IonButton className="btn-common" expand="block" disabled={showLoading} onClick={() => {
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
                                }}>OK</IonButton>
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