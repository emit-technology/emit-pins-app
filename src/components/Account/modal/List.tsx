import * as React from 'react';
import {
    IonButton,
    IonContent,
    IonRow,
    IonCol,
    IonButtons,
    IonAlert,
    IonIcon,
    IonModal,
    useIonToast, useIonAlert, IonLabel, IonText, IonItem, IonHeader, IonToolbar, IonTitle
} from "@ionic/react";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {useEffect, useState} from "react";
import walletWorker from "../../../worker/walletWorker";
import {
    closeOutline,
    copyOutline,
    downloadOutline, eyeOffOutline, eyeOutline, lockOpenOutline, refreshCircleOutline,
    trashOutline
} from "ionicons/icons";
import copy from "copy-to-clipboard";
import {QRCodeSVG} from 'qrcode.react';
import selfStorage from "../../../common/storage";
import {BackupModal} from "./Backup";
import {emitBoxSdk} from "../../../service/emitBox";
import {utils} from "../../../common";
import {tribeService} from "../../../service/tribe";

interface Props {
    isOpen: boolean;
    onOk: (account: AccountModel) => void;
    onClose: () => void;
    isLogin?: boolean
}

export const AccountList: React.FC<Props> = ({isOpen, isLogin, onClose, onOk}) => {

    const [accounts, setAccounts] = useState([]);
    // const [showBackupModal, setShowBackupModal] = useState(false);

    const [showAlert, setShowAlert] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [words, setWords] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    // const [mnemonic, setMnemonic] = useState("");

    const [present, dismiss] = useIonToast();

    const [presentAlert, dismissAlert] = useIonAlert();

    useEffect(() => {
        if(utils.useInjectAccount()){
            getAccounts().catch(e => console.error(e));
        }
    }, [isOpen])

    const getAccounts = async () => {
        const rest = await walletWorker.accounts()
        if (rest && rest.length >0) {
            setAccounts(rest)
            emitBoxSdk.setAccount(rest[0])
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
        }} canDismiss>

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
                    accounts && accounts.map((account: AccountModel, index) => {
                        return <div key={index}>

                            <div className="account-qr-box">
                                <div style={{display: "flex", justifyContent: "flex-end", height: 32}}>
                                    <IonButtons>
                                        <IonButton onClick={() => onClose()}>
                                            <IonIcon src={closeOutline} size="large" color='dark'/>
                                        </IonButton>
                                    </IonButtons>
                                </div>
                                <div>
                                    <IonRow>
                                        <IonCol sizeMd="2" sizeXs="3">
                                            <div style={{marginLeft: 20}}><img src="./assets/icon/icon.png" width="32"/>
                                            </div>
                                        </IonCol>
                                        <IonCol sizeMd="3" sizeXs="5">
                                            <div className="account-qr-code">
                                                <div>
                                                    <QRCodeSVG value={account.addresses[ChainType.EMIT]}/>
                                                </div>
                                            </div>
                                        </IonCol>
                                        <IonCol sizeMd="6" sizeXs="10" offset="1">
                                            <div className="account-address-text">
                                                <div>{account.addresses[ChainType.EMIT]}</div>
                                                {
                                                    !account.backedUp && <div className="account-backup-filter">
                                                        <div>
                                                            <IonButton onClick={() => {
                                                                presentAlert({
                                                                    header: 'Backup Identity',
                                                                    subHeader: 'Export Mnemonic words or Private Key.',
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
                                                            }} size="small">Backup Identity</IonButton>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </IonCol>
                                    </IonRow>
                                </div>
                            </div>
                            <div className="account-qr-fot">
                                <IonRow>
                                    <IonCol size="5">
                                        <div style={{padding: "12px 0 0 20px"}}>
                                            {/*<IonItem lines="none">*/}
                                            {/*    <IonAvatar slot='start'>*/}
                                            {/*        {*/}
                                            {/*            // account && account.name ?<Avatar name={account.name} round size={"40"}/>:<IonIcon src={personCircleOutline} size="large"/>*/}
                                            {/*        }*/}
                                            {/*    </IonAvatar>*/}
                                            {/*    <IonLabel><div>{account.name}</div></IonLabel>*/}
                                            {/*</IonItem>*/}
                                            <IonButton size="small" color={isLogin ? "danger" : "primary"}
                                                       onClick={() => onOk(account)}>{isLogin ? "Logout" : "Login"}</IonButton>
                                        </div>
                                    </IonCol>
                                    <IonCol size="7">
                                        <div className="account-info-icon">
                                            &nbsp;&nbsp;
                                            <div onClick={() => {
                                               walletWorker.lockWallet().then(()=>{
                                                   onClose();
                                               })
                                            }}><IonIcon src={lockOpenOutline} className="account-bt-icon"/></div>
                                            &nbsp;&nbsp;
                                            <div onClick={() => {
                                                copy(account && account.addresses[ChainType.EMIT])
                                                present({
                                                    position: "top",
                                                    color: "primary",
                                                    message: "Copied to clipboard!",
                                                    duration: 2000
                                                })
                                            }}><IonIcon src={copyOutline} className="account-bt-icon"/></div>
                                            &nbsp;&nbsp;
                                            <div onClick={() => {
                                                presentAlert({
                                                    header: 'Backup Identity',
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
                                            &nbsp;&nbsp;
                                            <div onClick={() => {
                                                presentAlert({
                                                    header: 'Delete Identity',
                                                    subHeader: 'You are deleting identity!',
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
                                                                walletWorker.removeAccount(account.accountId, e[0] as string).then(() => {
                                                                    selfStorage.removeItem("ACCOUNT");
                                                                    tribeService.userLogout().catch(e=>console.log(e))
                                                                    present({
                                                                        position: "top",
                                                                        color: "primary",
                                                                        message: "Delete Identity successfully!",
                                                                        duration: 2000
                                                                    }).then(() => {
                                                                        onClose();
                                                                    })
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

                <IonModal isOpen={showAlert} onDidDismiss={() => setShowAlert(false)} initialBreakpoint={0.6}
                          breakpoints={[0, 0.6, 0.75]} canDismiss>
                    <IonHeader collapse="fade">
                        <IonToolbar color="white">
                            <IonTitle>
                                Backup Identity
                            </IonTitle>
                            <IonIcon slot="end" src={closeOutline} size="large" onClick={() => {
                               setShowAlert(false);
                            }}/>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <div className="men-title" style={{fontSize: 15, margin: "0 12px"}}>
                            Write down these mnemonic words for identity recovery
                        </div>
                        <IonItem>
                            <IonLabel className="ion-text-wrap">
                                <div className="men-box">
                                    <IonRow>
                                        {
                                            words.split(" ").map(((value, index) => {
                                                return <IonCol sizeLg="3" key={index} sizeSm="4" sizeMd="4" size="4">
                                                    <div className="men-item">
                                                <span className="men-num"><IonText
                                                    color="primary">{index + 1}. </IonText></span>
                                                        <span className="men-text">
                                            <IonText color="dark">{value}</IonText>
                                        </span>
                                                    </div>
                                                </IonCol>
                                            }))
                                        }
                                    </IonRow>
                                </div>
                            </IonLabel>
                        </IonItem>
                        <IonRow>
                            <IonCol size="4">
                                <IonButton expand="block" size="small" fill="outline" onClick={() => setShowAlert(false)}>Close</IonButton>
                            </IonCol>
                            <IonCol size="8">
                                <IonButton expand="block" size="small" color="primary"
                                           onClick={() => setShowBackupModal(true)}>Next</IonButton>
                            </IonCol>
                        </IonRow>
                        <div className="account-note">
                            This information is sensitive. Your mnemonic words are the key to your PINs Identity. Please make sure to write it down and save it in a secure location. We CAN NOT retrieve or reset your mnemonic words if you lose it.
                        </div>
                    </IonContent>
                </IonModal>


                {/*<IonAlert*/}
                {/*    isOpen={showAlert}*/}
                {/*    onDidDismiss={() => setShowAlert(false)}*/}
                {/*    header="Info"*/}
                {/*    subHeader="Please write down"*/}
                {/*    message={words.split(" ").map((v, i) => `${i + 1} ${v}`).join(",")}*/}
                {/*    buttons={[*/}
                {/*        {*/}
                {/*            text: 'Close',*/}
                {/*            role: 'cancel',*/}
                {/*            handler: () => {*/}
                {/*            },*/}
                {/*        },*/}
                {/*        // {*/}
                {/*        //     text: 'Copy',*/}
                {/*        //     role: 'confirm',*/}
                {/*        //     handler: () => {*/}
                {/*        //         walletWorker.setBackedUp(selectedAccount.accountId);*/}
                {/*        //         copy(words)*/}
                {/*        //         setWords("")*/}
                {/*        //         setAccounts([]);*/}
                {/*        //         setTimeout(()=>{*/}
                {/*        //             getAccounts().catch(e => console.error(e));*/}
                {/*        //             present({*/}
                {/*        //                 position: "top",*/}
                {/*        //                 color: "primary",*/}
                {/*        //                 message: "Copied to clipboard!",*/}
                {/*        //                 duration: 2000*/}
                {/*        //             })*/}
                {/*        //         },100)*/}
                {/*        //     }*/}
                {/*        // },*/}
                {/*        {*/}
                {/*            text: 'Next',*/}
                {/*            role: 'confirm',*/}
                {/*            handler: () => {*/}
                {/*                setShowBackupModal(true)*/}
                {/*            },*/}
                {/*        },*/}
                {/*    ]}*/}
                {/*/>*/}

                <BackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} onOK={() => {
                    setShowBackupModal(false)
                    setShowAlert(false);
                    walletWorker.setBackedUp(selectedAccount.accountId).then(() => {
                        present({
                            position: "top",
                            color: "primary",
                            message: "Backup Identity successfully!",
                            duration: 2000
                        })
                        getAccounts().catch(e => console.error(e));
                    }).catch((e)=>{
                        console.error(e)
                    });
                }} account={selectedAccount} mnemonic={words && words.split(" ")}/>
            </IonContent>
        </IonModal>
    </>
}