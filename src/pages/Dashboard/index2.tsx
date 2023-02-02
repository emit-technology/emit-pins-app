import * as React from 'react';
import {
    IonActionSheet,
    IonButton,
    IonButtons,
    IonCol,
    IonFooter,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenu,
    IonMenuToggle,
    IonSplitPane,
    IonPage,
    IonRow,
    IonText,
    IonTitle,
    IonToast,
    IonToolbar, useIonAlert, useIonToast,createGesture, Gesture
} from "@ionic/react";
import {GroupMsg, Message, PinnedSticky, TribeInfo, TribeRole, WsStatus} from "../../types";
import {emitBoxSdk, tribeService} from "../../service";
import {AccountModel, ChainType, SettleResp} from "@emit-technology/emit-lib";
import {
    arrowBackOutline,
    close,
    addOutline,
    linkOutline,
    colorPaletteOutline,
    ellipsisVertical, heartCircleOutline,
    listOutline,
    pinOutline,
    share
} from "ionicons/icons";

// import addOutline from '../../img/createBlue.png'
// import linkOutline from '../../img/linkBlue.png'

import './index.scss';
import selfStorage from "../../common/storage";
import {RoleListModal} from "../../components/Role";
import {TribeEditModal} from "../../components/Tribe";
// import {Share} from '@capacitor/share';
import config from "../../common/config";
import {BottomBar} from "../../components/ChatRoom/Room/BottomBar";
import {PinnedMsgModal} from "../../components/ChatRoom/Room/Message/PinnedMsgModal";
import {TribeHeader} from "../../components/Tribe/TribeHeader";
import tribeWorker from "../../worker/imWorker";
import {ToolBar} from "../../components/ChatRoom/Room/ToolBar";
import {MessageContentVisualso as MessageContentVisual} from "../../components/ChatRoom/Room/Message/MessageVisualso";
import {ShareEx} from "../../components/utils/ShareEx";
import {SideBar} from "../../components/ChatRoom/SideBar";
import {AccountUnlock} from "../../components/Account/modal/Unlock";
import {AccountList} from "../../components/Account/modal/List";
import {ResetModal} from "../../components/Account/modal/Reset";
import walletWorker from "../../worker/walletWorker";
import {utils} from "../../common";
import {CreateModal} from "../../components/Account/modal";
import {RolesAvatarModal} from "../../components/Role/RolesAvatarModal";
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import copy from "copy-to-clipboard";
import {useAppDispatch, useAppSelector} from "../../common/state/app/hooks";

interface Props {
    tribeId: string
    router: any;
    msgId?: string
}

let checkInterVal = null;
let count = 0;

export const DashboardV2: React.FC<Props> = ({tribeId, router, msgId}) => {

    const [owner, setOwner] = useState("");
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showTribeEdit, setShowTribeEdit] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [roles, setRoles] = useState([]);
    const [groupMsgs, setGroupMsgs] = useState([]);
    const [isConnecting, setIsConnecting] = useState(WsStatus.inactive);
    const [showRoleAvatar, setShowRoleAvatar] = useState(false);
    const [showPinnedMsgDetailModal, setShowPinnedMsgDetailModal] = useState(false);
    const [showCreateTribe, setShowCreateTribe] = useState(false);
    const [showForkModal, setShowForkModal] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [groupPinnedMsg, setGroupPinnedMsg] = useState([]);

    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [latestMgs, setLatestMgs] = useState([]);
    const [isSessionAvailable, setIsSessionAvailable] = useState(false);

    const [showUnlock, setShowUnlock] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [forkGroupId, setForkGroupId] = useState("");

    const [alreadySelectRole, setAlreadySelectRole] = useState(false);
    const [hideMenu, setHideMenu] = useState(false);
    const [account, setAccount] = useState(null);
    const [latestRole, setLatestRole] = useState(null);
    const [tribeInfo, setTribeInfo] = useState(null);
    const [userLimit, setUserLimit] = useState(null);
    const [pinnedSticky, setPinnedSticky] = useState(null);

    const [forkTribeInfo, setForkTribeInfo] = useState(null);
    // const [firstItemIndex, setFirstItemIndex] = useState(-1);
    const [loaded, setLoaded] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const [timestamp, setTimestamp] = useState(Date.now());

    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();

    const dispatchData = useAppSelector(state => state.jsonData);

    useEffect(() => {
        if (dispatchData) {
            if (dispatchData.tag == 'initData') {
                initRole().catch(e=>console.error(e))
            }else if(dispatchData.tag == 'initTribeInfo'){
                console.log("initTribeInfo...")
                tribeService.tribeInfo(tribeId).then(tribeInfo=>{
                    console.log("tribe... info", tribeInfo)
                    setTribeInfo(tribeInfo);
                })
            }
        }
    }, [dispatchData.data]);

    // const init = async () => {
    //     checkInterVal = selfStorage.getItem("checkInterVal")
    //     if (checkInterVal) {
    //         clearInterval(checkInterVal)
    //
    //     }
    //     checkInterVal = setInterval(() => {
    //         checkWsAlive().catch(e => {
    //             console.error(e)
    //         });
    //     }, 2000)
    //
    //     selfStorage.setItem("checkInterVal",checkInterVal)
    // }

    const initLayoutData = async () => {
        const begin = Date.now();
        await tribeService.init();
        console.log("initLayoutData = [%d] ", Date.now() - begin)
        tribeWorker.init(config.tribeId).then(()=>{
            setLoaded(true);
        }).catch(e=>console.error(e))

        tribeService.userLimit(config.tribeId).catch(e=>console.error(e));
    }

    useLayoutEffect(() => {
        setAlreadySelectRole(!!selfStorage.getItem("alreadySelectRole"))
        setShowRoleAvatar(!!selfStorage.getItem("alreadySelectRole"))
        initLayoutData().then(() => {
            initData().catch(e => console.error(e))
        }).catch(e => {
            console.error(e);
        })
    }, [])

    useEffect(() => {
        document.addEventListener('visibilitychange', () => {
            try {
                if (!document.hidden) {
                    console.log("visibilitychange set status")
                    setTimestamp(Date.now())
                }
            } catch (e) {
                console.error(JSON.stringify(e))
            }
        })
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            tribeWorker.checkAlive(config.tribeId).then((rest: any) => {
                if (rest !== isConnecting) {
                    setIsConnecting(rest)
                }

                if (rest !== WsStatus.active) {
                    setIsSessionAvailable(false);
                }else{
                    setIsSessionAvailable(true);
                }

                if (rest == WsStatus.active && (!userLimit || (Math.floor(Date.now() / 1000)) % 9 == 0)) {
                    tribeService.tribeUserInfo().then(rest => {
                        config.userLimit = rest.limit;
                        console.log(!userLimit || userLimit.supportLeft != rest.limit.supportLeft || userLimit.msgLeft != rest.limit.msgLeft)
                        if (!userLimit || userLimit.supportLeft != rest.limit.supportLeft || userLimit.msgLeft != rest.limit.msgLeft) {
                            setUserLimit(rest.limit)
                        }
                        if (rest.subscribed != subscribed) {
                            setSubscribed(rest.subscribed)
                        }
                    })

                }
            })
        }, 2000);
        return () => clearInterval(interval);
    }, [isConnecting, timestamp, userLimit]);

    // const checkWsAlive = (setLimit,setConnecting) => {
    //     tribeWorker.checkAlive(config.tribeId).then((rest:any)=>{
    //         console.log("check status==> ", rest, isConnecting, rest !== isConnecting)
    //         if (rest !== isConnecting) {
    //             setConnecting(rest)
    //         }
    //
    //         if (rest == WsStatus.active && (!userLimit || (Math.floor(Date.now() / 1000)) % 9 == 0)) {
    //             tribeService.userLimit(config.tribeId).then(rest=>{
    //                 config.userLimit = rest;
    //                 console.log(!userLimit || userLimit.supportLeft != rest.supportLeft || userLimit.msgLeft != rest.msgLeft)
    //                 if (!userLimit || userLimit.supportLeft != rest.supportLeft || userLimit.msgLeft != rest.msgLeft) {
    //                     setLimit(rest)
    //                 }
    //             })
    //
    //         }
    //         setTimeout(()=>checkWsAlive(setLimit, setConnecting), 2000)
    //     })
    // }

    const initOwnerData = async () => {
        {
            const rest = await tribeService.tribeUserInfo();
            config.userLimit = rest.limit;
            setUserLimit(rest.limit);

            if (rest.subscribed != subscribed) {
                setSubscribed(rest.subscribed)
            }
        }
    }

    const showShareModal = async () => {
        const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, 1, 20)
        const latestMgs: Array<Message> = [];
        for (let ps of rest.data) {
            latestMgs.push(...ps.records)
        }
        setLatestMgs(latestMgs)
        setShowShare(true);
    }

    const initRole = async ()=>{
        const roles = await tribeService.tribeRoles(tribeId, false);
        let latestRoleId = selfStorage.getItem("latestRoleId");
        let role;
        if (!latestRoleId && roles && roles.length > 0) {
            role = roles[0]
        } else {
            if (roles && roles.length > 0) {
                role = roles.find(v => v.id == latestRoleId)
            }
            if (!role) {
                role = roles[0];
            }
        }
        setRoles(roles);
        setRoleFunc(role);
        return roles;
    }

    const initData = async () => {

        const account = await emitBoxSdk.getAccount();
        const tribeInfo = await tribeService.tribeInfo(tribeId);
        const owner = account && account.addresses && account.addresses[ChainType.EMIT.valueOf()]
        const f = await tribeService.isSessionAvailable()
        setIsSessionAvailable(f);

        const roles = await initRole();
        await fetchInboxNum();
        // const groupIds = tribeService.groupIdCache(); //await tribeService.groupIds(tribeId);
        const groupTribes = JSON.parse(JSON.stringify(tribeService.getGroupMap()))//await tribeService.groupedMsg(groupIds);
        // console.log("======> init data groupTribes", groupTribes)

        groupTribes.push({groupId: "", theme: tribeInfo.theme, records: [], roles: roles})
        setAccount(account);
        setOwner(owner);
        setTribeInfo(tribeInfo);
        setGroupMsgs(groupTribes)

    }

    const onSubscribe = useCallback((f) => {

        if (!f) {
            presentAlert({
                header: "Unlike",
                subHeader: "It will be dismissed from the home page , are you sure?",
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
                        handler: () => {
                            tribeService.unSubscribeTribe(config.tribeId).then(() => {
                                presentToast({
                                    color: "primary",
                                    message: "Operation successfully. It has be dismissed from the home page",
                                    duration: 2000
                                })
                                initOwnerData().catch(e => console.error(e))
                            }).catch(e => {
                                const err = typeof e == "string" ? e : e.message;
                                presentToast({message: err, position: "top", duration: 2000, color: "danger"})
                            })
                        },
                    },
                ]
            })
        } else {

            presentAlert({
                header: "Like",
                subHeader: "It will be displayed in the home page.",
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
                        handler: () => {
                            tribeService.subscribeTribe(config.tribeId).then(() => {
                                presentToast({
                                    color: "primary",
                                    message: "Operation successfully. It has be displayed in the home page",
                                    duration: 2000
                                })
                                initOwnerData().catch(e => console.error(e))
                            }).catch(e => {
                                const err = typeof e == "string" ? e : e.message;
                                presentToast({message: err, position: "top", duration: 2000, color: "danger"})
                            })
                        },
                    },
                ]
            })
        }

    }, [subscribed, setSubscribed])


    const menuButtons = useMemo(() => {
        const buttons = [
            {
                text: 'Verse', icon: addOutline, handler: () => {
                    console.log('Share clicked');
                    setShowCreateTribe(true)
                }
            },
            {
                text: 'Link', icon: linkOutline, handler: () => {
                    console.log('Link clicked');
                    copy(`${config.baseUrl}/${config.tribeId}`);
                    presentToast({color:"primary", message: "Copied to clipboard!", duration: 2000}).catch(e=>console.error(e))
                }
            },
            {
                text: 'Cancel', icon: close, role: 'cancel', handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        if (!!tribeInfo && owner == tribeInfo.keeper) {
            buttons.unshift({
                    text: 'Pin', icon: pinOutline, handler: () => {
                        setShowPin(true)
                    }
                },
                {
                    text: 'Dye', icon: colorPaletteOutline, handler: () => {
                        setShowTribeEdit(true)
                        console.log('Favorite clicked');
                    }
                },
                {
                    text: 'Ban Chat', icon: "./assets/img/icon/banChatBlue.png", handler: () => {
                        setShowTribeEdit(true)
                        console.log('Favorite clicked');
                    }
                },
                {
                    text: 'Resume Chat', icon: "./assets/img/icon/resumeChat.png", handler: () => {
                        setShowTribeEdit(true)
                        console.log('Favorite clicked');
                    }
                },
            )

        }
        return buttons
    }, [subscribed, owner, tribeInfo])

    const onSupport = async (msgId: string, f: boolean) => {
        if (userLimit && userLimit.supportLeft <= 0) {
            return Promise.reject(`reaching the max number(${userLimit.maxSupportCount})`)
        }
        await tribeService.msgSupport(msgId, f)
    }

    const showPinnedMsgDetail = async (groupId: string) => {
        const rest = await tribeService.groupedMsg([groupId], true);
        const ret = tribeService.convertGroupMsgToPinnedSticky(rest);
        setShowPinnedMsgDetailModal(true);
        setGroupPinnedMsg(ret);
    }

    const onAccount = async (account: AccountModel) => {
        const _isSessionAvailable = await tribeService.isSessionAvailable();
        if (!_isSessionAvailable) {
            await tribeService.accountLogin(account)
        } else {
            await tribeService.userLogout()
        }
        await initData();
    }

    const requestAccount = () => {
        if (utils.useInjectAccount()) {
            checkAccount().catch(e => console.error(e))
        } else {
            tribeService.getAccountAndLogin().then(() => {
                setShowUnlock(false);
                initData().catch(e => console.error(e));
            }).catch(e => {
                // const err = typeof e == 'string' ? e : e.message;
                // setShowToast(true)
                // setToastMsg(err)
            })
        }
    }

    const checkAccount = async () => {
        const isLock = await walletWorker.isLocked();
        if (isLock) {
            const accounts = await walletWorker.accounts();
            if (!accounts || accounts.length == 0) {
                setShowCreate(true)
            } else {
                setShowUnlock(true);
            }
        } else {
            setShowList(true);
        }
    }

    const fork = useCallback((groupId: string, tribeInfo: TribeInfo) => {
        setShowForkModal(true)
        setForkGroupId(groupId);
        setForkTribeInfo(tribeInfo)
    }, [])

    const showPinnedMsgFn = useCallback((groupId) => {
        showPinnedMsgDetail(groupId).catch(e => {
            console.log(e)
        })
    }, [])

    const onReload = useCallback((loadOwnerOnly?: boolean) => {
        if (loadOwnerOnly) {
            initOwnerData().catch(e => {
                console.error(e)
            })
        } else {
            initData().catch(e => {
                console.error(e)
            })
        }

    }, [])

    const onSupportFn = useCallback((msgId, f) => {
        onSupport(msgId, f).catch(e => {
            // const err = typeof e == 'string' ? e : e.message;
            // setShowToast(true)
            // setToastMsg(err)
        })
    }, [])

    const onPinFn = useCallback(() => {
        // tribeService.setCacheMsg(config.tribeId,[])
        setShowPin(false);
        initData().catch(e => {
            console.error(e)
        })
    }, [])

    const onChangeVisible = useCallback((v: PinnedSticky) => {
        setPinnedSticky(v)
    }, [])

    // const onChangeMsgIndex = useCallback((msgIndex: number) => {
    //     setFirstItemIndex(msgIndex);
    // }, [])

    const setRoleFunc = (v: TribeRole) => {
        let alreadySelectRole = selfStorage.getItem("alreadySelectRole")
        if (latestRole && !!latestRole.id) {
            alreadySelectRole = true
        } else {
            if (!alreadySelectRole) {
                alreadySelectRole = !!v.id;
            }
        }
        setLatestRole(v);
        setAlreadySelectRole(alreadySelectRole)
        setShowRoleAvatar(!alreadySelectRole)
        selfStorage.setItem("alreadySelectRole", alreadySelectRole)
        selfStorage.setItem("latestRoleId", v.id)
    }

    const setLatestRoleFn = useCallback((v: TribeRole) => {
        setRoleFunc(v)
    }, [latestRole, setLatestRole, setAlreadySelectRole, setShowRoleAvatar])


    // console.log("render parent...");

    const [inboxNum, setInboxNum] = useState(0);

    const fetchInboxNum = async ()=>{
        const account = await emitBoxSdk.getAccount();
        if(account && account.addresses){
            emitBoxSdk.emitBox.emitDataNode.getUnSettles(account.addresses[ChainType.EMIT]).then((inbox:Array<SettleResp>)=>{
                if(inbox){
                    setInboxNum(inbox.length);
                }
            })
        }
    }
    return <>
        {/*<IonRow style={{height: '100%'}}>*/}
        {/*    <IonCol sizeMd="8" sizeSm="12" sizeXs="12" style={{height: '100%'}}>*/}


        <IonSplitPane when="lg" contentId="main-content">
            <div className="ion-page" id="main-content">

                <IonMenu contentId="main-content-left" side="start" swipeGesture={false} onIonDidOpen={()=>{
                    fetchInboxNum()
                }}>
                    <IonHeader>
                        <IonToolbar className="msg-toolbar">
                            <IonMenuToggle>
                                <div style={{paddingLeft: 12}}>
                                    <img src="./assets/img/icon/backOutline.png" height={24}/>
                                </div>
                            </IonMenuToggle>
                            <IonTitle style={{opacity: 1}}>
                                <img height={30} src="./assets/img/pins-logo.png"/>
                            </IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-content-chat">
                        <SideBar inboxNum={inboxNum} router={router} onRequestAccount={() => {
                            initData().catch(e => console.error(e))
                        }} account={account} onLogout={() => {
                            initData().catch(e => console.error(e))
                        }} isSessionAvailable={isSessionAvailable}/>
                    </IonContent>
                </IonMenu>

                <IonPage>
                    <TribeHeader onReladData={onReload}
                                 tribeInfo={tribeInfo} roles={roles} wsStatus={isConnecting}
                                 stickyMsg={pinnedSticky} showPin={showPin}
                                 setShowActionSheet={setShowActionSheet}
                                 onCancelShowPin={()=>setShowPin(false)}
                    />

                    <IonContent fullscreen className="ion-content-chat padding-top-0">
                        <div className="msg-box">
                            <>
                                {
                                    isConnecting == WsStatus.tokenInvalid &&
                                    <div className="not-connect" onClick={() => {
                                        requestAccount();
                                    }}><IonText color="primary">No connection , <span style={{
                                        textDecoration: "underline",
                                        textUnderlineOffset: '4px',
                                        cursor: "pointer"
                                    }}>login</span></IonText></div>
                                }
                                {/*{*/}
                                {/*    isConnecting == WsStatus.inactive &&*/}
                                {/*    <div className="not-connect">Connecting...</div>*/}
                                {/*}*/}
                                <div className="msg-toolbar">
                                    <ToolBar/>
                                    <ShareEx owner={owner} roles={roles} latestMsg={latestMgs} isOpen={showShare}
                                             onClose={() => setShowShare(false)}
                                             tribeInfo={tribeInfo}/>
                                </div>
                            </>
                            <MessageContentVisual
                                onFork={fork}
                                loaded={!!loaded}
                                showPinnedMsgDetail={showPinnedMsgFn}
                                onReload={onReload}
                                tribeInfo={tribeInfo}
                                owner={owner}
                                onSupport={onSupportFn}
                                showPin={showPin}
                                userLimit={userLimit}
                                selectRole={latestRole}
                                shareMsgId={msgId}
                                subscribed={subscribed}
                                onSubscribe={onSubscribe}
                            />
                        </div>

                        <IonActionSheet
                            isOpen={showActionSheet}
                            onDidDismiss={() => setShowActionSheet(false)}
                            cssClass='my-custom-class'
                            buttons={menuButtons}
                        >

                        </IonActionSheet>
                        {
                            tribeInfo && <TribeEditModal isOpen={showTribeEdit}
                                                         onClose={() => setShowTribeEdit(false)}
                                                         onOk={(tribeId) => {
                                                             setShowTribeEdit(false);
                                                             initData().catch(e => {
                                                                 console.log(e)
                                                             })

                                                         }} tribeInfo={tribeInfo}/>
                        }
                        <TribeEditModal isOpen={showCreateTribe} onClose={() => setShowCreateTribe(false)}
                                        onOk={(tribeId) => {
                                            setShowCreateTribe(false)
                                            utils.goTo(tribeId)
                                        }}/>

                        <TribeEditModal forkGroupId={forkGroupId} tribeInfo={forkTribeInfo} isOpen={showForkModal}
                                        onClose={() => setShowForkModal(false)}
                                        onOk={(tribeId) => {
                                            setShowForkModal(false)
                                            // window.open(`/${tribeId}`)
                                            utils.goTo(tribeId)
                                        }}/>

                        <IonToast
                            isOpen={showToast}
                            onDidDismiss={() => setShowToast(false)}
                            message={toastMsg}
                            position="top"
                            color={"danger"}
                            duration={2000}
                        />

                    </IonContent>

                    <BottomBar alreadySelectRole={alreadySelectRole} isTokenValid={isSessionAvailable}
                               tribeInfo={tribeInfo} owner={owner} userLimit={userLimit}
                               onRoleCheck={setLatestRoleFn} roles={roles} selectRole={latestRole}
                               showPin={showPin} onPin={onPinFn}/>

                </IonPage>
            </div>


            <IonMenu contentId="main-content" side="end" className="main-content-menu-right">
                <RoleListModal
                    groupMsg={groupMsgs} tribeInfo={tribeInfo} roles={roles} defaultRole={latestRole}
                    onRoleCheck={setLatestRoleFn}
                    onReloadList={() => {
                        setTimeout(() => {
                            initData().catch(e => {
                                console.error(e)
                            })
                        }, 500)
                    }}/>
            </IonMenu>

        </IonSplitPane>

        {/*<IonMenu contentId="main-content">*/}
        {/*    <IonHeader>*/}
        {/*        <IonToolbar className="msg-toolbar">*/}
        {/*            <IonMenuToggle>*/}
        {/*                <div style={{paddingLeft: 12}}><IonIcon src={arrowBackOutline}/></div>*/}
        {/*            </IonMenuToggle>*/}
        {/*            <IonTitle>*/}
        {/*                <img height={28} src="./assets/img/pins-logo.png"/>*/}
        {/*            </IonTitle>*/}
        {/*        </IonToolbar>*/}
        {/*    </IonHeader>*/}
        {/*    <IonContent className="ion-padding">*/}
        {/*        <SideBar router={router} onRequestAccount={() => {*/}
        {/*            initData().catch(e => console.error(e))*/}
        {/*        }} account={account} onLogout={() => {*/}
        {/*            initData().catch(e => console.error(e))*/}
        {/*        }} isSessionAvailable={isSessionAvailable}/>*/}
        {/*    </IonContent>*/}
        {/*</IonMenu>*/}


        {/*<IonMenu contentId="main-content" side="end">*/}
        {/*    <IonHeader>*/}
        {/*        <IonToolbar className="msg-toolbar">*/}
        {/*            <IonMenuToggle>*/}
        {/*                <div style={{paddingLeft: 12}}><IonIcon src={arrowBackOutline}/></div>*/}
        {/*            </IonMenuToggle>*/}
        {/*            <IonTitle>*/}
        {/*                <img height={28} src="./assets/img/pins-logo.png"/>*/}
        {/*            </IonTitle>*/}
        {/*        </IonToolbar>*/}
        {/*    </IonHeader>*/}
        {/*    <IonContent className="ion-padding">*/}
        {/*        <RoleListModal*/}
        {/*            onChangeMsgIndex={onChangeMsgIndex}*/}
        {/*            pinnedSticky={pinnedSticky}*/}
        {/*            groupMsg={groupMsgs} tribeInfo={tribeInfo} roles={roles} defaultRole={latestRole}*/}
        {/*            onRoleCheck={setLatestRoleFn}*/}
        {/*            onReloadList={() => {*/}
        {/*                setTimeout(() => {*/}
        {/*                    initData().catch(e => {*/}
        {/*                        console.error(e)*/}
        {/*                    })*/}
        {/*                }, 500)*/}
        {/*            }}/>*/}

        {/*    </IonContent>*/}
        {/*</IonMenu>*/}


        {/*    </IonCol>*/}
        {/*    <IonCol sizeMd="4" sizeSm="12" sizeXs="12" style={{padding: "unset", height: '100%'}} className="role-list-col">*/}
        {/*        */}

        {/*    </IonCol>*/}
        {/*</IonRow>*/}
        {/*<IonLoading*/}
        {/*    cssClass='my-custom-class'*/}
        {/*    isOpen={isConnecting == WsStatus.inactive}*/}
        {/*    onDidDismiss={() => this.setState({isConnecting: WsStatus.active})}*/}
        {/*    message={'Connecting...'}*/}
        {/*    duration={60000}*/}
        {/*/>*/}
        <PinnedMsgModal isOpen={showPinnedMsgDetailModal} onClose={() => {
            setShowPinnedMsgDetailModal(false);
        }} data={{data: groupPinnedMsg, total: groupPinnedMsg.length}} tribeInfo={tribeInfo}/>

        <AccountList isLogin={isConnecting == WsStatus.active} isOpen={showList} onOk={(account) => {
            onAccount(account).then(() => {
                setShowList(false)
            }).catch(e => {
                const err = typeof e == 'string' ? e : e.message;
                setShowToast(true)
                setToastMsg(err)
                console.error(e)
            })
        }} onClose={() => setShowList(false)}/>

        <AccountUnlock isOpen={showUnlock} onOk={() => {
            setShowUnlock(false)
            setShowList(true);
        }} onClose={() => {
            setShowUnlock(false)
        }} onForgot={() => {
            setShowUnlock(false);
            setShowReset(true)
        }}/>

        <ResetModal isOpen={showReset} onOk={() => {
        }} onClose={() => {
            setShowReset(false)
        }} onUnlock={() => {
            setShowReset(false)
            setShowUnlock(true);
        }}/>

        <CreateModal isOpen={showCreate} onOk={(account) => {
            onAccount(account).then(() => {
                setShowCreate(false)
            }).catch((e) => {
                const err = typeof e == 'string' ? e : e.message;
                setShowToast(true)
                setToastMsg(err)
            });
        }} onClose={() => {
            setShowCreate(false)
        }}/>

        {
            roles && roles.length > 1 &&
            <RolesAvatarModal defaultRole={latestRole} roles={roles} onRoleCheck={setLatestRoleFn}
                              isOpen={showRoleAvatar && (!latestRole || latestRole && !latestRole.id)} onClose={() => {
                setShowRoleAvatar(false)
                selfStorage.setItem("alreadySelectRole", true)
            }}/>
        }

       <div style={{height: 0, position: "absolute", bottom: 0}}>
           {/*{*/}
           {/*    roles && roles.length > 0 && roles.map(role=>{*/}
           {/*        return <img src={utils.getDisPlayUrl((role as TribeRole).avatar)}/>*/}
           {/*    })*/}
           {/*}*/}
           {
              groupMsgs && groupMsgs.length > 0 && groupMsgs.map((gMsg: GroupMsg, index: number) =>{
                  return <img src={utils.getDisPlayUrl(gMsg.theme.image)} key={index} height={0}/>
              })
           }
       </div>
    </>
}