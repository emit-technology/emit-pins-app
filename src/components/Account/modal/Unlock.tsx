import * as React from 'react';
import {
    IonButton,
    IonButtons,
    IonItem,
    IonInput,
    IonLabel,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,IonPage,
    IonTitle,
    IonToolbar,
    IonRow, IonCol, IonText, useIonToast,
} from "@ionic/react";
import {closeOutline, lockOpenOutline, openOutline} from "ionicons/icons";
import walletWorker from "../../../worker/walletWorker";

interface Props {
    isOpen: boolean;
    onOk: () => void;
    onClose: () => void;
    onForgot: ()=>void;
}

export const AccountUnlock: React.FC<Props> = ({isOpen,onForgot, onClose, onOk}) => {

    const passwordRef = React.createRef();
    const [present,dismiss] = useIonToast();

    const unlock = async ()=>{
        //@ts-ignore
        const password = passwordRef && passwordRef.current.value;
        if(!password){
            present({message: "Please input password!", color: "danger", duration: 2000, position: "top"})
            return;
        }
        await walletWorker.unlockWallet(password)
        onOk();
    }
    return <>
        <IonModal isOpen={isOpen} className="unlock-modal" onDidDismiss={() => {
            onClose()
        }} swipeToClose>
            <IonToolbar >
                <IonTitle>Unlock Account</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={() => onClose()}>
                        <IonIcon src={closeOutline} size="large" color='dark'/>
                    </IonButton>
                </IonButtons>
            </IonToolbar>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    {
                        //@ts-ignore
                        <IonInput type="password" placeholder="Account password" ref={passwordRef}/>
                    }
                </IonItem>
                <IonButton expand="block" color="dark" onClick={()=>{
                    unlock().catch(e=>{
                        const err = typeof e == 'string'?e: e.message;
                        present({message: err, color: "danger", duration: 2000, position: "top"})
                        console.error(e)
                    })
                }}>Unlock</IonButton>

                <div className="ft-tip">
                    <div style={{textAlign: "center", fontWeight: 700, padding: '6px', cursor: "pointer"}}
                         onClick={() => {
                             onForgot();
                         }}><IonText color="dark"><small>Forgot password?</small></IonText></div>

                    {/*<div style={{textAlign: "center", fontWeight: 700, padding: '6px', cursor: "pointer"}}*/}
                    {/*     onClick={() => {*/}

                    {/*     }}><IonText color="dark"><small>Accounts <IonIcon src={openOutline}/></small></IonText>*/}
                    {/*</div>*/}
                </div>
            </IonContent>
        </IonModal>
    </>
}