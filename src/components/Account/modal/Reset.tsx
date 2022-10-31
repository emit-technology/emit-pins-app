import * as React from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon, IonInput, IonItem, IonLabel, IonLoading,
    IonModal,
    IonSegment, IonSegmentButton, IonText, IonTextarea,
    IonTitle,
    IonToolbar, useIonToast
} from "@ionic/react";
import {useState} from "react";
import walletWorker from "../../../worker/walletWorker";
import {AccountModel} from "@emit-technology/emit-lib";

interface Props {
    isOpen: boolean;
    onOk: (account:AccountModel)=>void;
    onClose: ()=>void;
    onUnlock: ()=>void;
}

export const ResetModal:React.FC<Props> = ({isOpen,onOk,onUnlock,onClose})=>{
    const [showTip, setShowTip] = useState(false);
    const passwordRef = React.createRef();
    const passwordCfmRef = React.createRef();
    const textRef = React.createRef();
    const [segment,setSegment] = useState("mnemonic");
    const [showLoading, setShowLoading] = useState(false);

    const [present, dismiss] = useIonToast();

    const importKey = async ()=>{
        //@ts-ignore
        if (!textRef || !textRef.current || !textRef.current.value) {
            present({position: "top", duration: 2000, color: "danger", message: segment?"Please Input Mnemonic":"Please Input Private Key"})
            return
        }
        //@ts-ignore
        if (!passwordRef || !passwordCfmRef || !passwordRef.current || !passwordCfmRef.current || passwordRef.current && !passwordRef.current.value || passwordCfmRef.current && !passwordCfmRef.current.value) {
            present({position: "top", duration: 2000, color: "danger", message: "Please input password!"})
            return
        }
        //@ts-ignore
        if (passwordRef.current.value.length < 8) {
            present({position: "top", duration: 2000, color: "danger", message: "Password at least 8 characters"})
            return
        }
        //@ts-ignore
        if (passwordRef.current.value !== passwordCfmRef.current.value) {
            present({position: "top", duration: 2000, color: "danger", message: "Password don't match!"})
            return
        }

        //@ts-ignore
        const accountId:any = await walletWorker.resetAccount(textRef.current.value, passwordRef.current.value);

        if(accountId){
            const account: AccountModel = await walletWorker.accountInfo(accountId)
            onOk(account)
        }
    }

    return <>
        <IonModal isOpen={isOpen} className="role-select-list" onDidDismiss={() => {
            onClose()
        }}>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => onUnlock() }>Unlock</IonButton>
                    </IonButtons>
                    <IonTitle>Reset Account</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonSegment value={segment} className="segment" color="secondary" mode="md" onIonChange={(e)=>{
                    setSegment(e.detail.value)
                }}>
                    <IonSegmentButton value="mnemonic">
                        <span className={segment == "mnemonic"?"seq-title":"seq-title-2"}><IonLabel color="dark">Mnemonic</IonLabel></span>
                    </IonSegmentButton>
                    <IonSegmentButton value="privateKey">
                        <span className={segment == "privateKey"?"seq-title":"seq-title-2"}><IonLabel color="dark">Private Key</IonLabel></span>
                    </IonSegmentButton>
                </IonSegment>
                <IonItem>
                    <IonLabel position="stacked">{segment == "mnemonic"?"Mnemonic":"Private Key"}</IonLabel>
                    {
                        //@ts-ignore
                        <IonTextarea ref={textRef} rows={2}  placeholder={segment == "mnemonic"?"Input Mnemonic":"Input Private Key"} />
                    }
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    {
                        //@ts-ignore
                        <IonInput ref={passwordRef} placeholder="Input password" type="password" onFocus={() => {
                            setShowTip(true)
                        }} onBlur={() => setShowTip(false)}/>
                    }
                </IonItem>
                <div style={{padding: "0 20px", display: showTip ? "block" : "none"}}><IonText color="primary">
                    <small>At least 8 characters, recommended to mix uppercase and lowercase alphabets,number and
                        symbols</small>
                </IonText></div>
                <IonItem>
                    <IonLabel position="stacked">Confirm Password</IonLabel>
                    {
                        //@ts-ignore
                        <IonInput ref={passwordCfmRef} placeholder="Input password" type="password"/>
                    }
                </IonItem>
                <IonButton expand="block" disabled={showLoading} onClick={()=>{
                    setShowLoading(true)
                    importKey().then(()=>{
                        setShowLoading(false)
                    }).catch(e=>{
                        const err = typeof e == 'string'?e:e.message;
                        present({message: err, color: "danger", duration: 2000, position: "top"})
                        setShowLoading(false)
                    })
                }}>Next</IonButton>
                <IonLoading
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    onDidDismiss={() => setShowLoading(false)}
                    message={'Please wait...'}
                    duration={60000}
                />
                <div style={{padding: 12}}>
                    EMIT-Account does not keep a copy of your password. If you’re having trouble unlocking your account, you will need to reset your wallet. You can do this by providing the Secret Recovery Phrase or Private Key you once used when you set up your wallet.
                    <b>This action will remove all your current wallet, and you’ll also be able to re-add any other accounts created previously.</b>
                </div>
            </IonContent>
        </IonModal>
    </>
}