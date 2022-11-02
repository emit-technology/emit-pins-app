import * as React from 'react';
import {
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonRow,
    IonCol,
    IonText,IonButtons,
    IonAlert,
    IonIcon,
    IonModal,
    IonAvatar, useIonToast, useIonAlert
} from "@ionic/react";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {useEffect, useState} from "react";
import walletWorker from "../../../worker/walletWorker";
import {
    chevronForwardOutline, closeOutline,
    copyOutline,
    documentOutline, downloadOutline, personCircleOutline, personOutline,
    trashOutline
} from "ionicons/icons";
import Avatar from "react-avatar";
import copy from "copy-to-clipboard";
import {utils} from "../../../common";
import {QRCodeSVG} from 'qrcode.react';
import selfStorage from "../../../common/storage";
import {BackupModal} from "./Backup";
interface Props {
    isOpen: boolean;
    onOk: (account: AccountModel) => void;
    onClose: () => void;
}

export const AccountList: React.FC<Props> = ({isOpen, onClose, onOk}) => {

    const [accounts, setAccounts] = useState([]);
    // const [showBackupModal, setShowBackupModal] = useState(false);

    const [showAlert, setShowAlert] = useState(false);
    const [words, setWords] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    // const [mnemonic, setMnemonic] = useState("");

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
        <IonModal isOpen={isOpen} className="account-info-modal" onDidDismiss={() => {
            onClose()
        }}>

            {/*<IonHeader collapse="fade">*/}
            {/*    <IonToolbar>*/}
            {/*        <IonButtons slot="start">*/}
            {/*            <IonButton onClick={() => {*/}
            {/*                walletWorker.lockWallet().then(()=>onClose())*/}
            {/*            }}>*/}
            {/*                <IonIcon src={lockOpenOutline} size="large" color='dark'/>*/}
            {/*            </IonButton>*/}
            {/*        </IonButtons>*/}
            {/*        <IonTitle>Account</IonTitle>*/}
            {/*        <IonButtons slot="end">*/}
            {/*            <IonButton onClick={() => onClose()}>*/}
            {/*                <IonIcon src={closeOutline} size="large" color='dark'/>*/}
            {/*            </IonButton>*/}
            {/*        </IonButtons>*/}
            {/*    </IonToolbar>*/}
            {/*</IonHeader>*/}
            <IonContent>
                {
                    accounts && accounts.map((account:AccountModel,index)=>{
                        return <div>

                            <div  className="account-qr-box">
                                {
                                    !account.backedUp && <div className="account-backup-filter">
                                        <div>
                                            <IonButton onClick={()=>{
                                                presentAlert({
                                                    header: 'Backup Account',
                                                    subHeader: 'Export Mnemonic or Private Key.',
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
                                                                setSelectedAccount(account.accountId)
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
                                            }}>Backup Account</IonButton>
                                        </div>
                                    </div>
                                }
                                <div style={{display: "flex", justifyContent: "flex-end",height: 32}}>
                                            <IonButtons >
                                                <IonButton onClick={() => onClose()}>
                                                    <IonIcon src={closeOutline} size="large" color='dark'/>
                                                </IonButton>
                                            </IonButtons>
                                </div>
                                <div>
                                    <IonRow>
                                        <IonCol sizeMd="2" sizeXs="3">
                                            <div style={{marginLeft: 20}}><img src="./assets/icon/icon.png" width="32"/></div>
                                        </IonCol>
                                        <IonCol sizeMd="3" sizeXs="5">
                                            <div className="account-qr-code">
                                                <div>
                                                    <QRCodeSVG value={account.addresses[ChainType.EMIT]} />
                                                </div>
                                            </div>
                                        </IonCol>
                                        <IonCol sizeMd="6" sizeXs="10" offset="1">
                                            <div className="account-address-text">
                                                <div>{account.addresses[ChainType.EMIT]}</div>
                                            </div>
                                        </IonCol>
                                    </IonRow>
                                </div>
                            </div>
                            <div className="account-qr-fot">
                                <IonRow>
                                    <IonCol size="5">
                                        <div style={{padding: "12px 0 0 12px"}}>
                                            <IonItem lines="none">
                                                <IonAvatar slot='start'>
                                                    {
                                                        // account && account.name ?<Avatar name={account.name} round size={"40"}/>:<IonIcon src={personCircleOutline} size="large"/>
                                                    }
                                                </IonAvatar>
                                                <IonLabel><div>{account.name}</div></IonLabel>
                                            </IonItem>
                                        </div>
                                    </IonCol>
                                    <IonCol size="7">
                                        <div className="account-info-icon">
                                            &nbsp;&nbsp;<div onClick={() => {
                                            copy(account && account.addresses[ChainType.EMIT])
                                            present({
                                                position: "top",
                                                color: "primary",
                                                message: "Copied to clipboard!",
                                                duration: 2000
                                            })
                                        }}><IonIcon src={copyOutline} className="account-bt-icon" /></div>
                                            &nbsp;&nbsp;<div  onClick={() => {
                                            presentAlert({
                                                header: 'Backup Account',
                                                subHeader: 'Export Mnemonic or Private Key.',
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
                                                            setSelectedAccount(account.accountId)
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

                                        }}><IonIcon src={downloadOutline} className="account-bt-icon"/></div>
                                            &nbsp;&nbsp;<div onClick={()=>{
                                            presentAlert({
                                                header: 'Delete Account',
                                                subHeader: 'You are deleting account!',
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
                                                                selfStorage.removeItem("ACCOUNT");
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

                                        }}><IonIcon src={trashOutline} className="account-bt-icon"/></div>
                                        </div>
                                    </IonCol>
                                </IonRow>
                            </div>
                        </div>
                    })
                }

                {/*{*/}
                {/*    false && accounts && accounts.map((account, index) => {*/}
                {/*        return <div key={index}><IonItem detail detailIcon={chevronForwardOutline} onClick={() => {*/}
                {/*            onOk(account)*/}
                {/*        }}>*/}
                {/*            <IonAvatar slot="start">*/}
                {/*                <Avatar name={account.name} round size={"40"}/>*/}
                {/*            </IonAvatar>*/}
                {/*            <IonLabel className="ion-text-wrap">*/}
                {/*                <div><b>{account.name}</b></div>*/}
                {/*                <div>*/}
                {/*                    <img src={'./assets/img/EMIT.png'} width={24} height={24}*/}
                {/*                         style={{transform: 'translateY(6px)'}}/>*/}
                {/*                    <IonText*/}
                {/*                        color="medium">{utils.ellipsisStr(account.addresses[ChainType.EMIT])}</IonText>*/}
                {/*                </div>*/}
                {/*            </IonLabel>*/}
                {/*        </IonItem>*/}
                {/*            <div style={{float: "right"}}>*/}
                {/*                <IonButton size="small" fill="outline" onClick={() => {*/}
                {/*                    copy(account && account.addresses[ChainType.EMIT])*/}
                {/*                    present({*/}
                {/*                        position: "top",*/}
                {/*                        color: "primary",*/}
                {/*                        message: "Copied to clipboard!",*/}
                {/*                        duration: 2000*/}
                {/*                    })*/}
                {/*                }}><IonIcon src={copyOutline}/>Copy</IonButton>*/}
                {/*                <IonButton size="small" fill="outline" onClick={() => {*/}
                {/*                    presentAlert({*/}
                {/*                        header: 'Please enter password',*/}
                {/*                        buttons: [*/}
                {/*                            {*/}
                {/*                                text: 'Cancel',*/}
                {/*                                role: 'cancel',*/}
                {/*                                handler: () => {*/}
                {/*                                },*/}
                {/*                            },*/}
                {/*                            {*/}
                {/*                                text: 'OK',*/}
                {/*                                role: 'confirm',*/}
                {/*                                handler: (e) => {*/}
                {/*                                    exportMnem(account.accountId, e[0] as string)*/}
                {/*                                }*/}
                {/*                            }*/}
                {/*                        ],*/}
                {/*                        inputs: [*/}
                {/*                            {*/}
                {/*                                type: 'password',*/}
                {/*                                placeholder: 'Password',*/}
                {/*                            }*/}
                {/*                        ],*/}
                {/*                    })*/}

                {/*                }}><IonIcon*/}
                {/*                    src={documentOutline}/>Backup</IonButton>*/}
                {/*                <IonButton size="small" fill="outline" color="danger" onClick={()=>{*/}
                {/*                    presentAlert({*/}
                {/*                        header: 'Please enter password',*/}
                {/*                        subHeader: 'You are deleting account',*/}
                {/*                        buttons: [*/}
                {/*                            {*/}
                {/*                                text: 'Cancel',*/}
                {/*                                role: 'cancel',*/}
                {/*                                handler: () => {*/}
                {/*                                },*/}
                {/*                            },*/}
                {/*                            {*/}
                {/*                                text: 'OK',*/}
                {/*                                role: 'confirm',*/}
                {/*                                handler: (e) => {*/}
                {/*                                    walletWorker.removeAccount(account.accountId, e[0] as string).then(()=>{*/}
                {/*                                        present({*/}
                {/*                                            position: "top",*/}
                {/*                                            color: "primary",*/}
                {/*                                            message: "Delete account successfully!",*/}
                {/*                                            duration: 2000*/}
                {/*                                        }).then(()=>{*/}
                {/*                                            onClose();*/}
                {/*                                        })*/}
                {/*                                    }).catch(e=>{*/}
                {/*                                        const err = typeof e == 'string'?e:e.message;*/}
                {/*                                        present({*/}
                {/*                                            position: "top",*/}
                {/*                                            color: "danger",*/}
                {/*                                            message: err,*/}
                {/*                                            duration: 2000*/}
                {/*                                        })*/}
                {/*                                    })*/}
                {/*                                }*/}
                {/*                            }*/}
                {/*                        ],*/}
                {/*                        inputs: [*/}
                {/*                            {*/}
                {/*                                type: 'password',*/}
                {/*                                placeholder: 'Password',*/}
                {/*                            }*/}
                {/*                        ],*/}
                {/*                    })*/}

                {/*                }}>*/}
                {/*                    <IonIcon src={trashOutline}/>Delete</IonButton>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    })*/}
                {/*}*/}

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
                                walletWorker.setBackedUp(selectedAccount.accountId);
                                copy(words)
                                setWords("")
                                setAccounts([]);
                                setTimeout(()=>{
                                    getAccounts().catch(e => console.error(e));
                                    present({
                                        position: "top",
                                        color: "primary",
                                        message: "Copied to clipboard!",
                                        duration: 2000
                                    })
                                },100)
                            }
                        }
                    ]}
                />

            </IonContent>
        </IonModal>
    </>
}