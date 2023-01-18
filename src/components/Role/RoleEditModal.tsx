import * as React from 'react';
import {MsgTextImage, TribeRole} from "../../types";
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent, IonLabel,
    IonTextarea,
    IonRow,
    IonCol,
    IonLoading, useIonToast, IonIcon
} from '@ionic/react';
import UploadImage from "../utils/UploadImage";
import {useState} from "react";
import {tribeService} from "../../service/tribe";
import config from "../../common/config";
import add from "../../img/add_circle.png";
import {utils} from "../../common";
import {ImageView} from "../utils/ImageView";
import {useAppDispatch} from "../../common/state/app/hooks";
import {saveDataState} from "../../common/state/slice/dataSlice";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onOk: (roleInfo: TribeRole) => void;

    roleInfo?: TribeRole
}

export const RoleEditModal: React.FC<Props> = ({isOpen, roleInfo, onOk, onClose}) => {

    const [imgUrl, setImgUrl] = useState(roleInfo && roleInfo.avatar);
    const [file, setFile] = useState(null);
    const [roleName, setRoleName] = useState(roleInfo && roleInfo.name);
    const [desc, setDesc] = useState(roleInfo && roleInfo.desc);
    const [present, dismiss] = useIonToast();
    const [showLoading, setShowLoading] = useState(false);
    React.useEffect(() => {
        setImgUrl(roleInfo ? roleInfo.avatar : null)
        setRoleName(roleInfo ? roleInfo.name : "")
        setDesc(roleInfo ? roleInfo.desc : "")
    }, [roleInfo])
    const dispatch = useAppDispatch();

    const commit = async () => {
        if (roleName.indexOf("http://") > -1 || roleName.indexOf("https:") > -1) {
            present({message: "Can't set url in the role name !", color: "danger", duration: 2000})
            return
        }
        if (roleInfo && !!roleInfo.roleType) {
            if (roleName) {
                await tribeService.setUserNFTName(roleInfo.id, roleName)
                dispatch(saveDataState({
                    tag: 'initData',
                    data: Date.now()
                }))

                setImgUrl(null)
                setDesc("")
                setRoleName("")

                onOk(roleInfo)
                setShowLoading(false)

                return
            }
        } else {
            if (!imgUrl && !file) {
                present({message: "Please upload avatar image !", color: "danger", duration: 2000})
                return
            }
            let imgUrlRemote = imgUrl;
            if (file) {
                imgUrlRemote["url"] = await tribeService.uploadServer(file as File)
            }

            if (desc.indexOf("http://") > -1 || desc.indexOf("https:") > -1) {
                present({message: "Can't set url in the role note !", color: "danger", duration: 2000})
                return
            }

            const ri: TribeRole = {
                avatar: imgUrlRemote,
                name: roleName,
                desc: desc,
                tribeId: config.tribeId,
                id: roleInfo && roleInfo.id
            }
            setShowLoading(true);
            await tribeService.addRole(ri)
            dispatch(saveDataState({
                tag: 'initData',
                data: Date.now()
            }))

            setFile(null)
            setImgUrl(null)
            setDesc("")
            setRoleName("")

            onOk(roleInfo)
            setShowLoading(false)
        }
    }
    return <>
        <IonModal isOpen={isOpen} className="role-select-list" onDidDismiss={() => onClose()} canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>{roleInfo ? "Update" : "New"} Role</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{borderRadius: 14, padding: "0 22px"}}>

                    <div style={{textAlign: "center", display: "flex", justifyContent: "center"}}>
                        {
                            (!roleInfo || roleInfo && !roleInfo.roleType) ?
                                <UploadImage defaultIcon={add} imgUrl={utils.getDisPlayUrl(imgUrl)}
                                             setImgUrl={(data, width, height) => {
                                                 setImgUrl({url: data.data_url, width: width, height: height})
                                                 setFile(data.file)
                                             }} height={200} width={200}/>
                                :
                                roleInfo && <ImageView url={roleInfo.avatar["url"]} width={200} height={200}/>
                        }
                    </div>

                    <div className={'common-title'} style={{padding: '12px 0'}}>Name</div>
                    <div style={{width: '100%'}}>

                        <IonTextarea className='input' rows={1} value={roleName}
                                     placeholder="Add a Name" style={{borderRadius: 6, paddingLeft: 8}}
                                     onIonChange={e => setRoleName(e.detail.value!)}/>
                    </div>

                    {
                        (!roleInfo || roleInfo && !roleInfo.roleType) && <>
                            <div className={'common-title'} style={{padding: '12px 0'}}>Note</div>
                            <IonTextarea className='input' rows={6} style={{borderRadius: 6, paddingLeft: 8}}
                                         value={desc} placeholder="Role Note"
                                         onIonChange={e => setDesc(e.detail.value!)}/>
                        </>
                    }
                </div>
                <IonRow>
                    <IonCol size="4">
                        <IonButton fill="outline" expand="block" onClick={() => onClose()}>Cancel</IonButton>
                    </IonCol>
                    <IonCol size="8">
                        <IonButton disabled={showLoading || (roleInfo && roleInfo.avatar == imgUrl &&
                            roleInfo.name == roleName &&
                            roleInfo.desc == desc)} expand="block"
                                   onClick={() => {
                                       setShowLoading(true)
                                       commit().then(() => {
                                           setShowLoading(false)
                                       }).catch(e => {
                                           setShowLoading(false)
                                           console.error(e)
                                           const err = typeof e == 'string' ? e : e.message;
                                           present({message: err, duration: 2000, color: "danger", position: "top"})
                                       });
                                       // onOk({
                                       //     avatar: imgUrl,
                                       //     name: roleName,
                                       //     desc: desc,
                                       //     tribeId: config.tribeId,
                                       //     id:roleInfo && roleInfo.id
                                       // })

                                   }}>{!!roleInfo ? "Update" : "Create"}</IonButton>
                    </IonCol>
                </IonRow>

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