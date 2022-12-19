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
import {addCircleOutline, createOutline, personOutline} from "ionicons/icons";
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

    return <>
        <IonModal isOpen={isOpen} className="role-select-list" onDidDismiss={() => onClose()} canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>Select Role</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" fullscreen >
                    <div style={{overflow: "scroll", height:'90%'}}>
                        {
                            roleInfoArr && roleInfoArr.map((v, i) => {
                                return <IonItem
                                    lines={i == 0 ? "full" : "none"}
                                    style={{borderRadius: (i == 0) ? "12px 12px 0 0" : i == roles.length - 1 ? "0 0 12px 12px" : ""}}
                                    color="tertiary" key={i} onClick={(e) => {
                                    e.stopPropagation()
                                    onRoleCheck(v)
                                }}>
                                    <IonAvatar slot="start" className="ion-avatar2">
                                        <img src={utils.getDisPlayUrl(v.avatar)}/>
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
                <div style={{padding: 12}}>
                    <IonButton size='small' expand="block" onClick={() => {
                        setRoleInfo(null)
                        setShowRoleModal(true)
                    }} ><IonIcon src={addCircleOutline}/> New Role</IonButton>
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