import * as React from 'react';
import {useEffect, useState} from 'react';
import {TribeRole} from "../../types";
import {
    IonAvatar, IonButton,
    IonButtons,
    IonCheckbox, IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel, IonModal,
    IonTitle,
    IonToolbar, useIonToast
} from "@ionic/react";
import {addCircleOutline, closeOutline, createOutline, personOutline} from "ionicons/icons";
import {RoleEditModal} from "./RoleEditModal";
import {utils} from "../../common";

interface Props {
    defaultRole: TribeRole
    roles: Array<TribeRole>
    onRoleCheck: (v: TribeRole) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const RolesPopover: React.FC<Props> = ({roles,isOpen,onClose, defaultRole, onRoleCheck}) => {

    const [showRoleModal, setShowRoleModal] = React.useState(false);
    const [roleInfo, setRoleInfo] = React.useState(null);
    const [roleInfoArr, setRoleInfoArr] = React.useState([]);
    const [present, dismiss] = useIonToast();
    useEffect(() => {
        setRoleInfoArr(roles);
    }, [roles])
    const _lineRoles = roles.filter(v=> !v.id || !!v.roleType)

    return <>
        <IonModal isOpen={isOpen} className="role-select-list" onDidDismiss={() => onClose()} canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>Pick a Role</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}><IonIcon src={closeOutline} size="large"/></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" fullscreen >
                <div className="role-pop-tip">
                    <img src="./assets/img/icon/infoBlueOutline.png" height={12}/>&nbsp;All ROLEs are fictional and only exist in current VERSE.
                </div>
                <div style={{overflow: "scroll", height:'85%'}}>
                    {
                        roleInfoArr && roleInfoArr.map((v, i) => {
                            return <IonItem
                                lines={(_lineRoles && _lineRoles.length>0 && _lineRoles[_lineRoles.length - 1].id == v.id) ? "full" : "none"}
                                style={{borderRadius: (i == 0) ? "12px 12px 0 0" : i == roles.length - 1 ? "0 0 12px 12px" : ""}}
                                color="tertiary" key={i} onClick={(e) => {
                                e.stopPropagation()
                                onRoleCheck(v)
                            }}>
                                <IonAvatar slot="start" className="ion-avatar2">
                                    <img src={utils.getDisPlayUrl(v.avatar)}/>
                                    {
                                        v && v.roleType && <div style={{position: "absolute",top: "14px", right: "-4px"}}>
                                            <img src="./assets/img/icon/nokiTag.png" height={14} width={14} />
                                        </div>
                                    }
                                </IonAvatar>
                                <IonLabel className="ion-text-wrap">
                                    <b style={{
                                        fontSize: '12px',
                                        color: defaultRole && v.id == defaultRole.id ? '' : '#868990'
                                    }}>{v.name}</b>
                                    {/*<p><IonText color="medium">{v.desc}</IonText></p>*/}
                                </IonLabel>
                                {
                                    defaultRole && v.id == defaultRole.id &&  <IonIcon slot="end" src={personOutline} size="small"/>
                                }
                                {
                                    (i > 0 ) &&
                                    <IonIcon size="small" slot="end" src={createOutline} color="medium"
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 setRoleInfo(v);
                                                 setShowRoleModal(true)
                                             }}/>
                                }

                            </IonItem>
                        })
                    }
                </div>
                <div style={{padding: "12px 0"}}>
                    <IonButton size='small' className="btn-radius" expand="block" onClick={() => {
                        setRoleInfo(null)
                        setShowRoleModal(true)
                    }} ><IonIcon src={addCircleOutline} style={{height: 24}} size="large"/> New Role</IonButton>
                </div>
                <RoleEditModal isOpen={showRoleModal} onClose={() => {
                    setShowRoleModal(false)
                    setRoleInfo(null)
                }} onOk={(roleInfo) => {
                    // tribeService.addRole(roleInfo).then(()=>{
                    setShowRoleModal(false);
                        // setShowLoading(false)

                    // }).catch(e=>{
                    //     // setShowLoading(false)
                    //     console.error(e)
                    //     const err = typeof e == 'string' ? e : e.message;
                    //     present(err,2000)
                    // })
                    setShowRoleModal(false)
                    setRoleInfo(null)
                    onClose();
                }} roleInfo={roleInfo}/>
            </IonContent>
        </IonModal>

    </>
}