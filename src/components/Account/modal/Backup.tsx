import * as React from 'react';
import {
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel, IonLoading, IonModal,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar, useIonToast
} from "@ionic/react";
import {closeOutline} from "ionicons/icons";
import {AccountModel} from "@emit-technology/emit-lib";
import {useEffect, useState} from "react";
import walletWorker from "../../../worker/walletWorker";

interface Props{
    isOpen: boolean;
    onClose: ()=>void;
    onOK: ()=>void;
    account: AccountModel;
    mnemonic: Array<string>;
}
export const BackupModal:React.FC<Props> = ({isOpen,mnemonic,onClose,onOK,account}) =>{

    const [rIndex,setRIndex] = useState(0);
    const [tempMnemonic,setTempMnemonic] = useState([]);
    const [showLoading, setShowLoading] = useState(false);

    const [present, dismiss] = useIonToast();
    useEffect(()=>{
        preload().catch(e=>console.error(e))
    },[isOpen])

    const preload = async () => {
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
    }

    const confirmBackup = async (v) => {
        if (v == mnemonic[rIndex]) {
            await walletWorker.setBackedUp(account.accountId);
            onOK();
        } else {
            await preload()
            return Promise.reject("Wrong values selected, please try again!")
        }
    }

    const sortWord = (a: string, b: string) => {
        return a.localeCompare(b)
    }
    return <IonModal
        mode="ios"
        isOpen={isOpen}
        swipeToClose={true}
        onDidDismiss={() => {
            onClose()
        }} initialBreakpoint={0.6}
        breakpoints={[0, 0.6, 0.75]}>
        <IonHeader collapse="fade">
            <IonToolbar color="white">
                <IonTitle>
                    Verification
                </IonTitle>
                <IonIcon slot="end" src={closeOutline} size="large" onClick={() => {
                    onClose()
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

        {/*<IonLoading*/}
        {/*    cssClass='my-custom-class'*/}
        {/*    isOpen={showLoading}*/}
        {/*    onDidDismiss={() => setShowLoading(false)}*/}
        {/*    message={'Please wait...'}*/}
        {/*    duration={60000}*/}
        {/*/>*/}
    </IonModal>
}