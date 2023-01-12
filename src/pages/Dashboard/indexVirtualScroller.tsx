import * as React from 'react';
import {
     useIonAlert, useIonToast
} from "@ionic/react";
import {GroupMsg, Message, PinnedSticky, TribeInfo, TribeRole, WsStatus} from "../../types";
import {emitBoxSdk, tribeService} from "../../service";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {
    addOutline,
    arrowBackOutline,
    close,
    colorPaletteOutline,
    ellipsisVertical, heartCircleOutline,
    listOutline,
    pinOutline,
    share
} from "ionicons/icons";
import './index.scss';
import selfStorage from "../../common/storage";
import {RoleListModal} from "../../components/Role";
import {TribeEditModal} from "../../components/Tribe";
// import {Share} from '@capacitor/share';
import config from "../../common/config";
import {BottomBar} from "../../components/ChatRoom/Room/BottomBar";
import {TribeHeader} from "../../components/Tribe/TribeHeader";
import tribeWorker from "../../worker/imWorker";
import {ToolBar} from "../../components/ChatRoom/Room/ToolBar";
import {ShareEx} from "../../components/utils/ShareEx";
import {SideBar} from "../../components/ChatRoom/SideBar";
import {AccountUnlock} from "../../components/Account/modal/Unlock";
import {AccountList} from "../../components/Account/modal/List";
import {ResetModal} from "../../components/Account/modal/Reset";
import walletWorker from "../../worker/walletWorker";
import {utils} from "../../common";
import {CreateModal} from "../../components/Account/modal";
import {RolesAvatarModal} from "../../components/Role/RolesAvatarModal";
import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {MessageContentVisualsoTest} from "../../components/ChatRoom/Room/Message/MessageVisualsoTest";
import {MessageContentVirtualScroller} from "../../components/ChatRoom/Room/Message/MessageVirtualScroller";

interface Props {
    tribeId: string
    router: any;
    msgId?: string
}

let checkInterVal = null;
let count = 0;

export const DashboardTestScroller: React.FC<Props> = ({tribeId, router, msgId}) => {

    const [owner, setOwner] = useState("");
    const [showLoading, setShowLoading] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showTribeEdit, setShowTribeEdit] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [roles, setRoles] = useState([]);
    const [buttons, setButtons] = useState([]);
    const [groupMsgs, setGroupMsgs] = useState([]);
    const [isConnecting, setIsConnecting] = useState(WsStatus.inactive);
    const [showRoleAvatar, setShowRoleAvatar] = useState(false);
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
    const [firstItemIndex, setFirstItemIndex] = useState(-1);
    const [loaded, setLoaded] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();

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
        await tribeService.init();
        await tribeWorker.init(config.tribeId)
    }

    useLayoutEffect(() => {
        setAlreadySelectRole(!!selfStorage.getItem("alreadySelectRole"))
        setShowRoleAvatar(!!selfStorage.getItem("alreadySelectRole"))
        initLayoutData().then(() => {
            setLoaded(true);
            initData().catch(e => console.error(e))
        }).catch(e => {
            console.error(e);
        })
    }, [])

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         tribeWorker.checkAlive(config.tribeId).then((rest: any) => {
    //             if (rest !== isConnecting) {
    //                 setIsConnecting(rest)
    //             }
    //
    //             if (rest == WsStatus.active && (!userLimit || (Math.floor(Date.now() / 1000)) % 9 == 0)) {
    //                 tribeService.tribeUserInfo().then(rest => {
    //                     config.userLimit = rest.limit;
    //                     console.log(!userLimit || userLimit.supportLeft != rest.limit.supportLeft || userLimit.msgLeft != rest.limit.msgLeft)
    //                     if (!userLimit || userLimit.supportLeft != rest.limit.supportLeft || userLimit.msgLeft != rest.limit.msgLeft) {
    //                         setUserLimit(rest.limit)
    //                     }
    //                     if (rest.subscribed != subscribed) {
    //                         setSubscribed(rest.subscribed)
    //                     }
    //                 })
    //
    //             }
    //         })
    //     }, 2000);
    //     return () => clearInterval(interval);
    // }, [isConnecting, userLimit]);

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


    const initData = async () => {
        const account = await emitBoxSdk.getAccount();
        const tribeInfo = await tribeService.tribeInfo(tribeId);
        const owner = account && account.addresses && account.addresses[ChainType.EMIT.valueOf()]
        const f = await tribeService.isSessionAvailable()

        const roles = await tribeService.tribeRoles(tribeId);
        // const groupIds = tribeService.groupIdCache(); //await tribeService.groupIds(tribeId);
        const groupTribes = JSON.parse(JSON.stringify(tribeService.getGroupMap()))//await tribeService.groupedMsg(groupIds);
        // console.log("======> init data groupTribes", groupTribes)

        groupTribes.push({groupId: "", theme: tribeInfo.theme, records: [], roles: roles})
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

        setAccount(account);
        setOwner(owner);
        setTribeInfo(tribeInfo);
        setRoles(roles);
        setLatestRoleFn(role);
        setGroupMsgs(groupTribes)
        setIsSessionAvailable(f);
    }

    const menuButtons = useMemo(() => {
        const buttons = [
            {
                text: 'Verse', icon: addOutline, handler: () => {
                    console.log('Share clicked');
                    setShowCreateTribe(true)
                }
            },
            // {
            //     text: 'Share', icon: share, handler: () => {
            //         console.log('Share clicked', navigator.share);
            //         showShareModal();
            //     }
            // },

            // {
            //     text: 'Subscribe', icon: heartCircleOutline, handler: () => {
            //         console.log('Share clicked', navigator.share);
            //         tribeService.subscribeTribe().then(()=>{
            //             present({position: "top", duration: 2000, color: "primary", message: "Subscribe successfully!"})
            //         })
            //     }
            // },
            {
                text: 'Cancel', icon: close, role: 'cancel', handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        if (!!tribeInfo &&  owner == tribeInfo.keeper) {
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
            )

        } else {
            if (subscribed) {
                buttons.unshift({
                        text: 'Unsubscribe', icon: heartCircleOutline, handler: () => {
                            presentAlert({
                                header: "Unsubscribe",
                                subHeader: "It will be dismissed from the home list , are you sure?",
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
                                                    message: "Unsubscribe successfully",
                                                    duration: 2000
                                                })
                                                initOwnerData().catch(e => console.error(e))
                                            })
                                        },
                                    },
                                ]
                            })
                        }
                    }
                )
            } else {
                buttons.unshift({
                        text: 'Subscribe', icon: heartCircleOutline, handler: () => {
                            presentAlert({
                                header: "Subscribe",
                                subHeader: "It will be displayed in the home list.",
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
                                                    message: "Subscribe successfully",
                                                    duration: 2000
                                                })
                                                initOwnerData().catch(e => console.error(e))
                                            })
                                        },
                                    },
                                ]
                            })
                        }
                    }
                )
            }
        }
        return buttons
    }, [subscribed, owner, tribeInfo])

    const onSupport = async (msgId: string, f: boolean) => {
        if (userLimit && userLimit.supportLeft <= 0) {
            return Promise.reject(`reaching the max number(${userLimit.maxSupportCount})`)
        }
        await tribeService.msgSupport(msgId, f)
    }

    const onAccount = async (account: AccountModel) => {
        if (!isSessionAvailable) {
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
                initData().catch(e => console.error(e));
            }).catch(e => {
                const err = typeof e == 'string' ? e : e.message;
                setShowToast(true)
                setToastMsg(err)
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
            const err = typeof e == 'string' ? e : e.message;
            setShowToast(true)
            setToastMsg(err)
        })
    }, [])

    const onRoleCheck = useCallback((v) => {
        setLatestRole(v)
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

    const onChangeMsgIndex = useCallback((msgIndex: number) => {
        setFirstItemIndex(msgIndex);
    }, [])

    const setLatestRoleFn = useCallback((v: TribeRole) => {
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
    }, [latestRole])

    console.log("parent render... ");
    return <>

                {
                    !!loaded && <MessageContentVirtualScroller
                        onFork={fork}
                        loaded={!!loaded}
                        onReload={onReload}
                        tribeInfo={tribeInfo}
                        owner={owner}
                        groupMsg={groupMsgs}
                        onSupport={onSupportFn}
                        showPin={showPin}
                        userLimit={userLimit}
                        selectRole={latestRole}
                        shareMsgId={msgId}
                        firstIndex={firstItemIndex}
                        onChangeVisible={onChangeVisible}
                        isConnecting={isConnecting}
                    />

                }
    </>
}