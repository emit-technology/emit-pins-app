import * as React from 'react';
import {AccountModel} from "@emit-technology/emit-lib";
import {
    IonButton,
    IonButtons,
    IonChip, IonItem, IonRow, IonCol, IonText,
    IonContent,
    IonHeader, IonIcon, IonInput,IonSegment,IonSegmentButton,
    IonLabel, IonRadioGroup, IonRadio,
    IonModal,
    IonTitle, IonTextarea, IonLoading, useIonToast,
    IonToolbar
} from "@ionic/react";
import {useEffect, useState} from "react";
import walletWorker from "../../../worker/walletWorker";
import {
    closeOutline,
    createOutline,
    downloadOutline, eyeOffOutline, eyeOutline,
    refreshCircleOutline,
} from "ionicons/icons";
import './create.css';

interface Props {
    isOpen: boolean;
    onOk: (account: AccountModel) => void;
    onClose: () => void;
}

export const CreateModal: React.FC<Props> = ({isOpen, onOk, onClose}) => {


    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [isOpenImport, setIsOpenImport] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [rIndex, setRIndex] = useState(-1);
    const [showTip, setShowTip] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showEye, setShowEye] = useState(false);
    const [mnemonic, setMnemonic] = useState([]);
    const [tempMnemonic, setTempMnemonic] = useState([]);
    const passwordRef = React.createRef();
    const passwordCfmRef = React.createRef();
    const textRef = React.createRef();
    const [segment,setSegment] = useState("mnemonic");

    const [present, dismiss] = useIonToast();

    useEffect(() => {
        setIsOpenCreate(isOpen)
        genMen();
    }, [isOpen])

    const genMen = () => {
        walletWorker.generateMnemonic().then((rest: any) => {
            if (!!rest) {
                setMnemonic(rest.split(" "))
            }
        })
    }

    const confirm = async () => {
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
        const accountId:any = await walletWorker.importMnemonic(mnemonic.join(" "), "", passwordRef.current.value, "", "");
        const account: AccountModel = await walletWorker.accountInfo(accountId)
        setShowBackupModal(false);
        setIsOpenCreate(false)
        onOk(account)
    }


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

        let accountId
        if (segment == "mnemonic") {
            //@ts-ignore
            accountId = await walletWorker.importMnemonic(textRef.current.value, "", passwordRef.current.value, "", "");
        } else {
            //@ts-ignore
            accountId = await walletWorker.importPrivateKey(textRef.current.value, "", passwordRef.current.value, "", "");
        }
        if(accountId){
            const account: AccountModel = await walletWorker.accountInfo(accountId)
            await walletWorker.setBackedUp(accountId);
            setIsOpenImport(false);
            onOk(account)
        }
    }

    const preBackup = async () => {
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

        const mnemonicStr: any = await walletWorker.generateMnemonic();
        const rIndex = Math.floor(Math.random() * 12);
        const wordstr = mnemonic[rIndex];
        const tmp = mnemonicStr.split(" ");

        const genMen: Array<string> = [];
        for (let word of tmp) {
            if (genMen.length == 2) {
                break;
            }
            if (word != wordstr) {
                genMen.push(word);
            }
        }
        genMen.push(wordstr);
        genMen.sort(sortWord)

        setTempMnemonic(genMen);
        setRIndex(rIndex);
        setShowBackupModal(true);
    }


    const sortWord = (a: string, b: string) => {
        return a.localeCompare(b)
    }

    const confirmBackup = async (v) => {
        if (v == mnemonic[rIndex]) {
            await confirm();
            setShowBackupModal(false);
        } else {
            await preBackup()
            return Promise.reject("Wrong values selected, please try again!")
        }
    }
    return <>
        <IonModal isOpen={isOpenCreate} className="role-select-list" onDidDismiss={() => {
            setIsOpenCreate(false)
            onClose();
        }} canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            setIsOpenImport(true)
                            setIsOpenCreate(false)
                        }}><IonIcon
                            src={downloadOutline}/> Recovery</IonButton>
                    </IonButtons>
                    <IonTitle>Create Identity</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel className="ion-text-wrap">
                        <div className="men-title">
                            Write down these mnemonic words for identity recovery &nbsp;<IonIcon src={refreshCircleOutline}
                                                            style={{cursor: "pointer", transform: 'translateY(4px)'}}
                                                            color="primary" onClick={() => genMen()}/>
                            &nbsp; {
                            !showEye ? <IonIcon src={eyeOffOutline}
                                               style={{cursor: "pointer", transform: 'translateY(4px)'}}
                                               color="primary" onClick={() => setShowEye(true)}/>:
                                <IonIcon src={eyeOutline}
                                         style={{cursor: "pointer", transform: 'translateY(4px)'}}
                                         color="primary" onClick={() => setShowEye(false)}/>
                        }
                        </div>
                        <div className="men-box">
                            <IonRow>
                                {
                                    mnemonic.map(((value, index) => {
                                        return <IonCol sizeLg="3" key={index} sizeSm="4" sizeMd="4" size="4">
                                            <div className="men-item">
                                                <span className="men-num"><IonText
                                                    color="primary">{index + 1}. </IonText></span>
                                                <span className="men-text">
                                            <IonText color="dark">{showEye?value:"***"}</IonText>
                                        </span>
                                            </div>
                                        </IonCol>
                                    }))
                                }
                            </IonRow>
                        </div>
                    </IonLabel>
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

                <div style={{marginTop: 12}}>
                    <IonButton expand="block" disabled={showLoading} onClick={() => {
                        setShowLoading(true);
                        confirm().then(()=>{
                            setShowLoading(false);
                        }).catch(e => {
                            setShowLoading(false);
                            const err = typeof e == 'string'?e:e.message;
                            present({message: err, color: "danger", duration: 2000, position: "top"})
                            console.error(e)
                        });
                    }}>Next</IonButton>
                </div>
                <IonLoading
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    onDidDismiss={() => setShowLoading(false)}
                    message={'Please wait...'}
                    duration={60000}
                />
            </IonContent>
        </IonModal>

        <IonModal isOpen={isOpenImport} className="role-select-list" onDidDismiss={() => {
            setIsOpenImport(false);
        }} canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            setIsOpenImport(false)
                            setIsOpenCreate(true)
                        }}><IonIcon
                            src={createOutline}/> Create</IonButton>
                    </IonButtons>
                    <IonTitle>Recovery Account</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => {
                            setIsOpenImport(false);
                            setIsOpenCreate(false);
                            onClose();
                        }}>Close</IonButton>
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
            </IonContent>
        </IonModal>


        <IonModal
            mode="ios"
            isOpen={showBackupModal}
            canDismiss={true}
            onDidDismiss={() => {
                setShowBackupModal(false)
            }} className="role-select-list">
            <IonHeader collapse="fade">
                <IonToolbar color="white">
                    <IonTitle>
                        Verification
                    </IonTitle>
                    <IonIcon slot="end" src={closeOutline} size="large" onClick={() => {
                        setShowBackupModal(false)
                    }}/>
                </IonToolbar>
            </IonHeader>
            <IonContent scrollY className="ion-padding">
                <div style={{padding: '6px 20px'}}>Please select <b><IonText
                    color="primary">#{rIndex + 1}th</IonText></b> word based on their numbers.
                </div>
                <IonItem>
                    <IonLabel className="ion-text-wrap">
                        <IonRow>
                            {
                                tempMnemonic && tempMnemonic.map((v, i) => {
                                    return <IonChip color="primary" outline key={i} onClick={() => {
                                        setShowLoading(true)
                                        confirmBackup(v).then(()=>{
                                            setShowLoading(false)
                                        }).catch(e => {
                                            setShowLoading(false)
                                            const err = typeof e == 'string'?e: e.message;
                                            present({message: err, color: "danger", duration: 2000, position: "top"})
                                            console.error(e)
                                        })
                                    }}><b>{v}</b></IonChip>
                                })
                            }
                        </IonRow>
                    </IonLabel>
                </IonItem>
            </IonContent>

            <IonLoading
                cssClass='my-custom-class'
                isOpen={showLoading}
                onDidDismiss={() => setShowLoading(false)}
                message={'Please wait...'}
                duration={60000}
            />
        </IonModal>
    </>
}