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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onOk: (roleInfo: TribeRole) => void;

    roleInfo?: TribeRole
}

export const RoleEditModal: React.FC<Props> = ({isOpen, roleInfo, onOk, onClose}) => {

    const [imgUrl, setImgUrl] = useState(roleInfo && roleInfo.avatar);
    const [roleName, setRoleName] = useState(roleInfo && roleInfo.name);
    const [desc, setDesc] = useState(roleInfo && roleInfo.desc);
    const [present, dismiss] = useIonToast();
    const [showLoading, setShowLoading] = useState(false);
    React.useEffect(()=>{
        setImgUrl(roleInfo ? roleInfo.avatar:null)
        setRoleName(roleInfo ? roleInfo.name:"")
        setDesc(roleInfo ? roleInfo.desc:"")
    },[roleInfo])

    return <>
        <IonModal isOpen={isOpen} className="role-select-list" onDidDismiss={() => onClose()}>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>{roleInfo?"Update":"New"} Role</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{borderRadius: 14, padding: "0 22px"}}>
                    {/*<RowItemCenterWrapper style={{width: '100%', marginTop: 20}}>*/}
                    {/*    <UploadImage imgUrl={imgUrl} setImgUrl={setImgUrl} width={50}/>*/}
                    {/*    /!*{*!/*/}
                    {/*    /!*    !!roleInfo && <div className="edit-avatar-icon" onClick={(e)=>{*!/*/}
                    {/*    /!*        e.persist()*!/*/}
                    {/*    /!*    }}>*!/*/}
                    {/*    /!*        <IonIcon src={createOutline}/>*!/*/}
                    {/*    /!*    </div>*!/*/}
                    {/*    /!*}*!/*/}
                    {/*    <div style={{marginLeft: 15, width: '100%'}}>*/}

                    {/*        {*/}
                    {/*            !roleInfo && <>*/}

                    {/*                <div className={'common-title'}>Name</div>*/}
                    {/*                <IonTextarea className='input' rows={1} value={roleName}*/}
                    {/*                         placeholder="Add a Name" readonly={!!roleInfo} style={{borderRadius: 6, paddingLeft: 8}}*/}
                    {/*                         onIonChange={e => setRoleName(e.detail.value!)}/>*/}
                    {/*                         </>*/}
                    {/*        }*/}
                    {/*        {*/}
                    {/*            !!roleInfo && <IonLabel>{roleInfo.name}</IonLabel>*/}
                    {/*        }*/}
                    {/*    </div>*/}
                    {/*</RowItemCenterWrapper>*/}
                    {/*<div className={'common-title'} style={{padding: '12px 0'}}>Avatar</div>*/}

                    <div style={{textAlign: "center"}}>
                        <UploadImage defaultIcon={add} imgUrl={utils.getDisPlayUrl(imgUrl)} setImgUrl={(url, width, height) => setImgUrl({url: url,width:width,height:height})} height={200} width={200}  />
                    </div>

                    <div className={'common-title'} style={{padding: '12px 0'}}>Name</div>
                    <div style={{ width: '100%'}}>

                        <IonTextarea className='input' rows={1} value={roleName}
                                     placeholder="Add a Name"  style={{borderRadius: 6, paddingLeft: 8}}
                                     onIonChange={e => setRoleName(e.detail.value!)}/>
                    </div>

                    <div className={'common-title'}  style={{padding: '12px 0'}}>Note</div>
                    <IonTextarea className='input' rows={6} style={{borderRadius: 6, paddingLeft: 8}}
                                 value={desc} placeholder="Role Note"
                                 onIonChange={e => setDesc(e.detail.value!)}/>
                </div>
                <IonRow>
                    <IonCol size="4">
                        <IonButton fill="outline" expand="block" onClick={()=>onClose()}>Cancel</IonButton>
                    </IonCol>
                    <IonCol size="8">
                        <IonButton disabled={showLoading} expand="block" onClick={() => {
                            if (!imgUrl || !(imgUrl as MsgTextImage).url){
                                present({message: "Please upload avatar image !", color:"danger", duration: 2000})
                                return
                            }
                            const ri:TribeRole = {
                                avatar: imgUrl,
                                name: roleName,
                                desc: desc,
                                tribeId: config.tribeId,
                                id:roleInfo && roleInfo.id
                            }
                            setShowLoading(true);
                            tribeService.addRole(ri).then(()=>{
                                setImgUrl(null)
                                setDesc("")
                                setRoleName("")

                                onOk(roleInfo)
                                setShowLoading(false)

                            }).catch(e=>{
                                setShowLoading(false)
                                console.error(e)
                                const err = typeof e == 'string' ? e : e.message;
                                present({message:err,duration:2000,color:"danger",position:"top"})
                            })

                            // onOk({
                            //     avatar: imgUrl,
                            //     name: roleName,
                            //     desc: desc,
                            //     tribeId: config.tribeId,
                            //     id:roleInfo && roleInfo.id
                            // })

                        }}>Ok</IonButton>
                    </IonCol>
                </IonRow>


            </IonContent>
        </IonModal>
    </>
}