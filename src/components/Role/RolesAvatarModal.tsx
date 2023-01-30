import * as React from 'react';
import {useEffect} from 'react';
import {TribeRole} from "../../types";
import {
    IonAvatar, IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonTitle,IonRow,IonCol,
    IonToolbar, useIonToast
} from "@ionic/react";
import {utils} from "../../common";
import {closeOutline} from "ionicons/icons";

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
        <IonModal isOpen={true} className="role-avatar-modal" style={{zIndex: 1000}} onDidDismiss={() => onClose()}  canDismiss>
            <IonToolbar color="secondary">
                <IonTitle><div className="pick-title">Pick a Role</div></IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={() => onClose()}><IonIcon src={closeOutline} size="large"/></IonButton>
                </IonButtons>
            </IonToolbar>
            <IonContent fullscreen >
                    <div style={{overflow: "scroll", height:'90%'}}>
                        <div className="pick-box">
                            <div className="pick-tip">*All selectable roles are fictional.</div>
                        </div>
                        <div className="pick-ctn">
                            <IonRow>
                                {
                                    roleInfoArr && roleInfoArr.map((v, i) => {
                                        if(i>0){
                                            return <IonCol className="avatar-col" sizeMd="3" sizeXs="4" key={i} onClick={()=>{
                                                onRoleCheck(v)
                                            }}>
                                                <div className="pick-item">
                                                    <div className="pick-avatar">
                                                        <img src={utils.getDisPlayUrl(v.avatar)}/>
                                                    </div>
                                                    <div className="pick-name">
                                                        <div>{v.name}</div>
                                                    </div>
                                                </div>
                                            </IonCol>
                                        }else{
                                            return <div key={i}></div>
                                        }
                                    })
                                }
                            </IonRow>
                        </div>
                    </div>
            </IonContent>
        </IonModal>

    </>
}