import * as React from 'react';
import {
    useIonToast,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
    IonBadge,
    IonLoading, IonAvatar, IonMenuToggle
} from '@ionic/react';
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {utils} from "../../../common";
import {tribeService} from "../../../service/tribe";
import {CreateModal} from "../../Account/modal";
import {useCallback, useEffect, useLayoutEffect, useState} from "react";
import walletWorker from "../../../worker/walletWorker";
import {AccountList} from "../../Account/modal/List";
import {AccountUnlock} from "../../Account/modal/Unlock";
import {ResetModal} from "../../Account/modal/Reset";
import {AssetsModal} from "../../Assets/Modal";
import Avatar from "react-avatar";
import {CatList} from "../../Cat";
import {useAppDispatch, useAppSelector} from "../../../common/state/app/hooks";
import {saveDataState} from "../../../common/state/slice/dataSlice";

// import { useHistory } from 'react-router-dom';


interface Props {
    onRequestAccount: () => void;
    account?: AccountModel
    onLogout: () => void;
    isSessionAvailable: boolean
    router?: any;
    inboxNum: number
    isModal?: boolean
    nokiId?: string
    nokiReward?: string;
    opType?: string;
}

let cb: any;

export const SideBar: React.FC<Props> = ({
                                             onRequestAccount, account,
                                             isModal, router,
                                             onLogout, inboxNum, isSessionAvailable,
                                             nokiId, nokiReward, opType
                                         }) => {

    const [present, dismiss] = useIonToast();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showAssetsModal, setShowAssetsModal] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showCatList, setShowCatList] = useState(false);
    const [catItems, setCatItems] = useState([]);
    const [nokiParams, setNokiParams] = useState(null);

    const dispatch = useAppDispatch();

    // const history = useHistory();

    useLayoutEffect(() => {
        if (opType) {
            setNokiParams({nokiId: nokiId, nokiReward: nokiReward, opType: opType})
            showCats().catch(e => console.error(e))

        } else {
            setNokiParams(null)
        }
    }, [nokiId, nokiReward, opType])

    const requestAccount = () => {
        if (utils.useInjectAccount()) {
            checkAccount().catch(e => console.error(e))
        } else {
            tribeService.getAccountAndLogin().then(() => {
                onRequestAccount()
            }).catch(e => {
                // const err = typeof e == 'string' ? e : e.message;
                // present({position: "top", color: "danger", message: err, duration: 2000})
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
        if (isSessionAvailable) {
            await tribeService.userLogout()
        } else {
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

    const showCats = async () => {
        const items = await tribeService.catItems();
        setCatItems(items);
        if (items && items.length > 0) {
            dispatch(saveDataState({
                tag: 'initData',
                data: Date.now()
            }))
        }
        setShowCatList(true)
    }

    const adoptCat = async () => {
        await tribeService.adpotNoki()
        const items = await tribeService.catItems();
        setCatItems(items);
    }

    // const dispatchData = useAppSelector(state => state.jsonData);
    //
    // useEffect(() => {
    //     if (dispatchData) {
    //         console.log("init initNoki")
    //         if (dispatchData.tag == 'initNoki') {
    //             setShowCatList(false);
    //             setNokiParams(null)
    //             showCats()
    //         }
    //     }
    // }, [dispatchData.data]);

    return <div style={{position: "relative", height: "100%"}}>
        {
            (window.location.pathname != "/" || isModal) &&
            <IonItem lines="none" style={{marginTop: 14}} onClick={() => {
                if (window.location.pathname != "/") {
                    window.location.href = "/"
                } else if (isModal) {
                    dispatch(saveDataState({
                        tag: 'closeTribeDetailModal',
                        data: Date.now()
                    }))
                }
            }}>
                {/*<IonIcon slot="start" src={homeOutline} size="large"/>*/}
                <img src="./assets/img/icon/homeOutline.png" height={24} slot="start"/>
                <IonLabel className="side-text">Home</IonLabel>
            </IonItem>
        }

        {/*<IonItem onClick={() => {*/}
        {/*    window.location.href = "./test2/4E6BFunxNE5"*/}
        {/*}}>*/}
        {/*    <IonIcon slot="start" src={homeOutline} size="large"/>*/}
        {/*    <IonLabel>Test</IonLabel>*/}
        {/*</IonItem>*/}

        <IonItem lines="none" style={{marginTop: 8}} onClick={() => {
            requestAccount();
        }}>
            {
                (!account || !!account && !account.name) &&
                <img src="./assets/img/icon/personOutline.png" height={24} slot="start"/>
            }
            {
                !!account && account.name && <IonAvatar slot="start">
                    <Avatar name={account.name} round size={"32"}/>
                </IonAvatar>
            }
            <IonLabel className="side-text">
                {!!account && account.name ? account.name : 'Identity'}&nbsp;{!!account && <>
                <IonText
                    color="medium">[<small>{!!account && utils.ellipsisStr(account && account.addresses && account.addresses[ChainType.EMIT], 3)}</small>]</IonText>
            </>}
            </IonLabel>
            {/*<IonIcon src={chevronForwardOutline} color="medium" slot="end" size="small"/>*/}
        </IonItem>

        <IonItem lines="none" style={{marginTop: 8}} onClick={() => {
            checkAssets()
        }}>
            {/*<IonIcon slot="start" src={walletOutline} size="large"/>*/}
            <img src="./assets/img/icon/walletOutline.png" height={24} slot="start"/>
            <IonLabel className="side-text">Assets
                {inboxNum > 0 &&
                <IonBadge color={"danger"} style={{transform: "translateY(2px)", marginLeft: 2}}>{inboxNum}</IonBadge>}
            </IonLabel>
            {/*<IonIcon src={utils.useInjectAccount() ? chevronForwardOutline : openOutline} color="medium" slot="end"*/}
            {/*         size="small"/>*/}
        </IonItem>

        <IonMenuToggle>
            <IonItem lines="none" style={{marginTop: 8}} onClick={() => {
                setNokiParams(null);
                showCats().catch(e => console.error(e))
            }}>
                {/*<IonIcon slot="start" src={catSvg} size="large"/>*/}
                <img src="./assets/img/icon/catOutline.png" height={24} slot="start"/>
                <IonLabel className="side-text">Noki</IonLabel>
            </IonItem>
        </IonMenuToggle>

        <IonItem lines="none" style={{marginTop: 8}} onClick={() => {
            window.open("https://emit.technology/pins/terms-of-service");
        }}>
            {/*<IonIcon slot="start" src={catSvg} size="large"/>*/}
            <img src="./assets/img/icon/termOfService.png" height={24} slot="start"/>
            <IonLabel className="side-text">Terms of Service</IonLabel>
        </IonItem>


        <IonItem lines="none" style={{marginTop: 8}} onClick={() => {
            window.open("https://emit.technology/pins/privacy-policy");
        }}>
            {/*<IonIcon slot="start" src={catSvg} size="large"/>*/}
            <img src="./assets/img/icon/privacyPolicy.png" height={24} slot="start"/>
            <IonLabel className="side-text">Privacy Policy</IonLabel>
        </IonItem>

        <div style={{position: "absolute", bottom: 100, left: 20}}>

            {
                isSessionAvailable ?
                    <IonButton className="login-btn" size="small" expand="block" color="danger" onClick={() => {
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
                    <IonButton size="small" className="login-btn" expand="block" onClick={() => {
                        requestAccount();
                    }}>Login</IonButton>
            }
        </div>

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
                cb().then(() => setShowLoading(false)).catch(e => {
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

        <CatList nokiData={nokiParams} isOpen={showCatList} onClose={() => {
            document.getElementById("toggleBtn").click();
            setTimeout(()=>{
                setShowCatList(false)
            },100)
        }} items={catItems}
                 onAdoptCat={() => {
                     setShowLoading(true)
                     adoptCat().then(() => {
                         setShowLoading(false)
                     }).catch(e => {
                         const err = typeof e == 'string' ? e : e.message;
                         setShowLoading(false)
                         present({position: "top", color: "danger", message: err, duration: 2000})
                     })
                 }}/>

        <IonLoading
            cssClass='my-custom-class'
            isOpen={showLoading}
            onDidDismiss={() => setShowLoading(false)}
            message={'Please wait...'}
            duration={60000}
        />
    </div>
}