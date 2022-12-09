import * as React from 'react';
import {
    IonList,
    IonItemDivider,
    useIonToast,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
    IonIcon,
    IonMenuToggle, IonContent, IonLoading, IonAvatar
} from '@ionic/react';
import {
    chevronForwardOutline,
    homeOutline, listOutline,
    openOutline,
    personOutline,
    swapHorizontalOutline,
    walletOutline
} from "ionicons/icons";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {utils} from "../../../common";
import {tribeService} from "../../../service/tribe";
import {CreateModal} from "../../Account/modal";
import {useState} from "react";
import walletWorker from "../../../worker/walletWorker";
import {AccountList} from "../../Account/modal/List";
import {AccountUnlock} from "../../Account/modal/Unlock";
import {ResetModal} from "../../Account/modal/Reset";
import {AssetsModal} from "../../Assets/Modal";
import Avatar from "react-avatar";
import copy from "copy-to-clipboard";
import selfStorage from "../../../common/storage";

interface Props {
    onRequestAccount: () => void;
    account?: AccountModel
    onLogout: () => void;
    isSessionAvailable: boolean
    router?: any;
}

let cb: any;

export const SideBar: React.FC<Props> = ({onRequestAccount, account,router, onLogout, isSessionAvailable}) => {

    const [present, dismiss] = useIonToast();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showAssetsModal, setShowAssetsModal] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    const requestAccount = () => {
        if (utils.useInjectAccount()) {
            checkAccount().catch(e => console.error(e))
        } else {
            tribeService.getAccountAndLogin().then(() => {
                onRequestAccount()
            }).catch(e => {
                const err = typeof e == 'string' ? e : e.message;
                present({position: "top", color: "danger", message: err, duration: 2000})
            })
        }
    }

    const checkAccount = async () => {
        const isLock = await walletWorker.isLocked();
        if (isLock) {
            cb = checkAccount;
            const accounts = await walletWorker.accounts();
            if (!accounts || accounts.length == 0) {
                setShowCreateModal(true)
            } else {
                setShowUnlock(true)
            }
        } else {
            setShowList(true)
        }
    }

    const onAccount = async (account: AccountModel) => {
        if(isSessionAvailable){
            await tribeService.userLogout()
        }else{
            await tribeService.accountLogin(account)
        }
        onRequestAccount()
    }

    const checkAssets = async () => {
        if (utils.useInjectAccount()) {
            const isLock = await walletWorker.isLocked();
            if (isLock) {
                cb = checkAssets;
                const accounts = await walletWorker.accounts();
                if (!accounts || accounts.length == 0) {
                    setShowCreateModal(true)
                } else {
                    setShowUnlock(true)
                }
            } else {
                setShowAssetsModal(true)
            }
        } else {
            window.open(utils.assetUrl())
        }
    }
    return <>
        {
            window.location.pathname != "/" && <IonItem onClick={() => {
                if (window.location.pathname != "/") {
                    window.location.href = "/"
                }
            }}>
                <IonIcon slot="start" src={homeOutline} size="large"/>
                <IonLabel>HOME</IonLabel>
            </IonItem>
        }

        {/*<IonItem onClick={() => {*/}
        {/*    window.location.href = "./test2/4E6BFunxNE5"*/}
        {/*}}>*/}
        {/*    <IonIcon slot="start" src={homeOutline} size="large"/>*/}
        {/*    <IonLabel>Test</IonLabel>*/}
        {/*</IonItem>*/}

        <IonItem onClick={() => {
            requestAccount();
        }}>
            {
                !account && <IonIcon slot="start" src={personOutline} size="large"/>
            }
            {
                !!account &&  <IonAvatar slot="start">
                    {account.name?<Avatar name={account.name} round size={"36"}/>:<IonIcon src={personOutline} size="large"/>}
                </IonAvatar>
            }
            <IonLabel className="ion-text-wrap">
                <b>{!!account&&account.name ? account.name : 'Person'}</b>
                <p>
                    <small>{!!account && utils.ellipsisStr(account && account.addresses && account.addresses[ChainType.EMIT], 3)}</small>
                </p>
            </IonLabel>
            <IonIcon src={chevronForwardOutline} color="medium" slot="end" size="small"/>
        </IonItem>

        <IonItem onClick={() => {
            checkAssets()
        }}>
            <IonIcon slot="start" src={walletOutline} size="large"/>
            <IonLabel>Assets</IonLabel>
            <IonIcon src={utils.useInjectAccount()?chevronForwardOutline:openOutline} color="medium" slot="end" size="small"/>
        </IonItem>

        <IonItem onClick={() => {
            const pushToken = selfStorage.getItem("pushTokenValue")
            if(pushToken){
                copy(pushToken)
                alert(pushToken)
            }else{
                const pushTokenErr = selfStorage.getItem("pushTokenErr")
                copy(pushTokenErr)
                alert(pushTokenErr)
            }
        }}>
            <IonIcon slot="start" src={walletOutline} size="large"/>
            <IonLabel>Push Token</IonLabel>
            <IonIcon src={utils.useInjectAccount()?chevronForwardOutline:openOutline} color="medium" slot="end" size="small"/>
        </IonItem>

        <div style={{height: 30}}>
        </div>
        {
            isSessionAvailable ? <IonButton size="small" expand="block" color="danger" onClick={() => {
                    setShowLoading(true)
                    tribeService.userLogout().then(() => {
                        setShowLoading(false)
                        onLogout()
                    }).catch(e => {
                        setShowLoading(false)
                        const err = typeof e == 'string' ? e : e.message;
                        present({position: "top", color: "danger", message: err, duration: 2000})
                    })
                }}>Logout</IonButton> :
                <IonButton size="small" expand="block" onClick={() => {
                    requestAccount();
                }}>Login</IonButton>
        }

        <CreateModal isOpen={showCreateModal} onOk={(account) => {
            setShowLoading(true)
            onAccount(account).then(() => {
                setShowLoading(false)
                setShowCreateModal(false);
            }).catch((e) => {
                setShowLoading(false)
                const err = typeof e == 'string' ? e : e.message;
                present({position: "top", color: "danger", message: err, duration: 2000})
                setShowCreateModal(false);
            });
        }} onClose={() => {
            setShowCreateModal(false);
        }}/>

        <AccountList isLogin={isSessionAvailable} isOpen={showList} onOk={(account) => {
            setShowLoading(true)
            onAccount(account).then(() => {
                setShowLoading(false)
                setShowList(false)
            }).catch(e => {
                setShowLoading(false)
                const err = typeof e == 'string' ? e : e.message;
                present({position: "top", color: "danger", message: err, duration: 2000})
                if (err.indexOf("Account locked") > -1) {
                    setShowList(false);
                    setShowCreateModal(true);
                }
                console.error(e)
            })
        }} onClose={() => setShowList(false)}/>

        <AccountUnlock isOpen={showUnlock} onOk={() => {
            setShowUnlock(false);
            setShowLoading(true)
            if (cb) {
                cb().then(()=> setShowLoading(false)).catch(e=>{
                    setShowLoading(false)
                })
            }
        }} onClose={() => {
            setShowUnlock(false);
        }} onForgot={() => {
            setShowUnlock(false)
            setShowReset(true)
        }}/>

        <ResetModal isOpen={showReset} onOk={(account) => {
            setShowLoading(true)
            onAccount(account).then(() => {
                setShowLoading(false)
                setShowReset(false);
            }).catch((e) => {
                setShowLoading(false)
                const err = typeof e == 'string' ? e : e.message;
                present({position: "top", color: "danger", message: err, duration: 2000})
                setShowReset(false);
            });
        }} onClose={() => {
            setShowReset(false)
        }} onUnlock={() => {
            setShowReset(false)
            setShowUnlock(true)
        }}/>

        <AssetsModal address={account && account.addresses[ChainType.EMIT]} isOpen={showAssetsModal}
                     onClose={() => setShowAssetsModal(false)}/>

        <IonLoading
            cssClass='my-custom-class'
            isOpen={showLoading}
            onDidDismiss={() => setShowLoading(false)}
            message={'Please wait...'}
            duration={60000}
        />
    </>
}