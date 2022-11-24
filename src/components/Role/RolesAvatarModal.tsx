import * as React from 'react';
import {useEffect} from 'react';
import {TribeRole} from "../../types";
import {
    IonAvatar, IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,IonRow,IonCol,
    IonToolbar, useIonToast
} from "@ionic/react";
import {utils} from "../../common";

interface Props {
    defaultRole: TribeRole
    roles: Array<TribeRole>
    onRoleCheck: (v: TribeRole) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const RolesAvatarModal: React.FC<Props> = ({roles,isOpen,onClose, defaultRole, onRoleCheck}) => {

    const [roleInfoArr, setRoleInfoArr] = React.useState([]);
    useEffect(() => {
        setRoleInfoArr(roles);
    }, [roles])

    return <>
        <IonModal isOpen={isOpen} className="role-avatar-modal" onDidDismiss={() => onClose()}>
            <IonToolbar>
                <IonTitle>Select a role to actor</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={() => onClose()}>Close</IonButton>
                </IonButtons>
            </IonToolbar>
            <IonContent className="ion-padding" fullscreen >
                    <div style={{overflow: "scroll", height:'90%'}}>
                        <IonRow>
                            {
                                roleInfoArr && roleInfoArr.map((v, i) => {
                                    if(i>0){
                                        return <IonCol className="avatar-col" size="2" key={i} onClick={()=>{
                                            onRoleCheck(v)
                                        }}>
                                            <IonAvatar className="ion-avatar2">
                                                <img src={utils.getDisPlayUrl(v.avatar)}/>
                                            </IonAvatar>
                                        </IonCol>
                                    }else{
                                        return <div key={i}></div>
                                    }
                                })
                            }
                        </IonRow>
                    </div>
            </IonContent>
        </IonModal>

    </>
}