import * as React from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonItem,
    IonLabel,
    IonRow,
    IonCol,
    IonText,
    IonHeader,
    IonAlert,
    IonIcon,
    IonModal,
    IonTitle,
    IonToolbar, IonAvatar, useIonToast, useIonAlert
} from "@ionic/react";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {useEffect, useState} from "react";
import walletWorker from "../../../worker/walletWorker";
import {
    arrowForwardOutline,
    chevronForwardOutline, closeOutline,
    copyOutline,
    documentOutline,
    lockOpenOutline,
    trashOutline
} from "ionicons/icons";
import Avatar from "react-avatar";
import copy from "copy-to-clipboard";
import {utils} from "../../../common";

interface Props {
    isOpen: boolean;
    onOk: (account: AccountModel) => void;
    onClose: () => void;
}

export const AccountList: React.FC<Props> = ({isOpen, onClose, onOk}) => {

    const [accounts, setAccounts] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [words, setWords] = useState("");
    const [present, dismiss] = useIonToast();

    const [presentAlert, dismissAlert] = useIonAlert();

    useEffect(() => {
        getAccounts().catch(e => console.error(e));
    }, [isOpen])

    const getAccounts = async () => {
        const rest = await walletWorker.accounts()
        if (rest) {
            setAccounts(rest)
        }
    }

    const exportMnem = async (accountId: string, password: string) => {
        walletWorker.exportMnemonic(accountId, password).then((rest: any) => {
            setWords(rest);
            setShowAlert(true)
        }).catch(e => {
            const err = typeof e == 'string' ? e : e.message;
            present({
                position: "top",
                color: "danger",
                message: err,
                duration: 2000
            })
        })
    }

    return <>
        <IonModal isOpen={isOpen} className="unlock-modal" onDidDismiss={() => {
            onClose()
        }}>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            walletWorker.lockWallet().then(()=>onClose())
                        }}>
                            <IonIcon src={lockOpenOutline} size="large" color='dark'/>
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Account</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>
                            <IonIcon src={closeOutline} size="large" color='dark'/>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {
                    accounts && accounts.map((account, index) => {
                        return <div key={index}><IonItem detail detailIcon={chevronForwardOutline} onClick={() => {
                            onOk(account)
                        }}>
                            <IonAvatar slot="start">
                                <Avatar name={account.name} round size={"40"}/>
                            </IonAvatar>
                            <IonLabel className="ion-text-wrap">
                                <div><b>{account.name}</b></div>
                                <div>
                                    <img src={'./assets/img/EMIT.png'} width={24} height={24}
                                         style={{transform: 'translateY(6px)'}}/>
                                    <IonText
                                        color="medium">{utils.ellipsisStr(account.addresses[ChainType.EMIT])}</IonText>
                                </div>
                            </IonLabel>
                        </IonItem>
                            <div style={{float: "right"}}>
                                <IonButton size="small" fill="outline" onClick={() => {
                                    copy(account && account.addresses[ChainType.EMIT])
                                    present({
                                        position: "top",
                                        color: "primary",
                                        message: "Copied to clipboard!",
                                        duration: 2000
                                    })
                                }}><IonIcon src={copyOutline}/>Copy</IonButton>
                                <IonButton size="small" fill="outline" onClick={() => {
                                    presentAlert({
                                        header: 'Please enter password',
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                role: 'cancel',
                                                handler: () => {
                                                },
                                            },
                                            {
                                                text: 'OK',
                                                role: 'confirm',
                                                handler: (e) => {
                                                    exportMnem(account.accountId, e[0] as string)
                                                }
                                            }
                                        ],
                                        inputs: [
                                            {
                                                type: 'password',
                                                placeholder: 'Password',
                                            }
                                        ],
                                    })

                                }}><IonIcon
                                    src={documentOutline}/>Backup</IonButton>
                                <IonButton size="small" fill="outline" color="danger" onClick={()=>{
                                    presentAlert({
                                        header: 'Please enter password',
                                        subHeader: 'You are deleting account',
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                role: 'cancel',
                                                handler: () => {
                                                },
                                            },
                                            {
                                                text: 'OK',
                                                role: 'confirm',
                                                handler: (e) => {
                                                    walletWorker.removeAccount(account.accountId, e[0] as string).then(()=>{
                                                        present({
                                                            position: "top",
                                                            color: "primary",
                                                            message: "Delete account successfully!",
                                                            duration: 2000
                                                        }).then(()=>{
                                                            onClose();
                                                        })
                                                    }).catch(e=>{
                                                        const err = typeof e == 'string'?e:e.message;
                                                        present({
                                                            position: "top",
                                                            color: "danger",
                                                            message: err,
                                                            duration: 2000
                                                        })
                                                    })
                                                }
                                            }
                                        ],
                                        inputs: [
                                            {
                                                type: 'password',
                                                placeholder: 'Password',
                                            }
                                        ],
                                    })

                                }}>
                                    <IonIcon src={trashOutline}/>Delete</IonButton>
                            </div>
                        </div>
                    })
                }

                {/*<CreateModal isOpen={showCreate} onOk={()=>{*/}
                {/*    getAccounts().catch(e=>console.error(e))*/}
                {/*    setShowCreate(false)*/}
                {/*}} onClose={()=>setShowCreate(false)}/>*/}

                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Info"
                    subHeader="Please write down"
                    message={words}
                    buttons={[
                        {
                            text: 'Close',
                            role: 'cancel',
                            handler: () => {
                            },
                        },
                        {
                            text: 'Copy',
                            role: 'confirm',
                            handler: () => {
                                copy(words)
                                present({
                                    position: "top",
                                    color: "primary",
                                    message: "Copied to clipboard!",
                                    duration: 2000
                                })
                            }
                        }
                    ]}
                />

            </IonContent>
        </IonModal>
    </>
}