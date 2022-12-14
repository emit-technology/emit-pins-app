import * as React from 'react';
import {
    IonActionSheet,
    IonButton,
    IonButtons,
    IonCol, IonToast,
    IonContent,
    IonHeader,
    IonIcon,
    IonLoading,
    IonPage,
    IonText,
    IonRow,
    IonTitle,
    IonToolbar, IonMenu, IonMenuToggle
} from "@ionic/react";
import {GroupMsg, Message, PinnedSticky, TribeInfo, TribeRole, TribeTheme, UserLimit, WsStatus} from "../../types";
import {emitBoxSdk, tribeService} from "../../service";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {
    addOutline, arrowBackOutline,
    close, colorPaletteOutline,
    ellipsisVertical, listOutline, menuOutline,
    personCircleOutline,
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
import {PinnedMsgModal} from "../../components/ChatRoom/Room/Message/PinnedMsgModal";
import {TribeHeader} from "../../components/Tribe/TribeHeader";
import tribeWorker from "../../worker/imWorker";
import {ToolBar} from "../../components/ChatRoom/Room/ToolBar";
import {MessageContentVisual} from "../../components/ChatRoom/Room/Message";
// import {MessageContentWindow as MessageContentVisual} from "../../components/ChatRoom/Room/Message";
import Avatar from "react-avatar";
import {ShareEx} from "../../components/utils/ShareEx";
import {SideBar} from "../../components/ChatRoom/SideBar";


interface State {
    datas: Array<Message>;
    owner: string;
    account?: AccountModel
    showLoading: boolean;
    showActionSheet: boolean;
    showTribeEdit: boolean;

    latestRole?: TribeRole;

    tribeInfo?: TribeInfo
    roles: Array<TribeRole>;

    showPin: boolean;
    buttons: Array<any>

    groupMsgs: Array<GroupMsg>

    showMenusModal: boolean

    isConnecting: WsStatus
    isUpdating: boolean;
    defaultTheme?: TribeTheme
    showPinnedMsg: boolean
    showShare: boolean
    latestMgs: Array<Message>;


    showPinnedMsgDetailModal: boolean;
    showCreateTribe: boolean;
    groupPinnedMsg: Array<PinnedSticky>;

    userLimit?: UserLimit

    showAlert: boolean;
    showToast: boolean;
    toastMsg?: string;
    isSessionAvailable: boolean

}

interface Props {
    tribeId: string
}

let checkInterVal;

export class Dashboard extends React.Component<Props, State> {

    state: State = {
        datas: [],
        owner: "",
        showLoading: false,
        showActionSheet: false,
        showTribeEdit: false,
        showPin: false,
        roles: [],
        buttons: [],
        groupMsgs: [],
        showMenusModal: false,
        isConnecting: WsStatus.inactive,
        isUpdating: false,
        showPinnedMsg: false,
        showPinnedMsgDetailModal: false,
        showCreateTribe: false,
        groupPinnedMsg: [],

        showAlert: false,
        showShare: false,
        showToast: false,
        latestMgs: [],
        isSessionAvailable: false
    }

    componentDidMount() {
        this.init().then(() => {

        }).catch(e => {
            console.error(e);
        })
    }

    init = async () => {
        await tribeWorker.init(config.tribeId)
        await this.checkWsAlive();
        await this.initData()

        checkInterVal = selfStorage.getItem("checkInterVal")
        if (checkInterVal) {
            clearInterval(checkInterVal)

        }
        checkInterVal = setInterval(() => {
            this.checkWsAlive().catch(e => {
                console.error(e)
            });
        }, 2000)

        selfStorage.setItem("checkInterVal", checkInterVal)
    }

    checkWsAlive = async () => {
        const {userLimit, isConnecting} = this.state;
        const rest: WsStatus = await tribeWorker.checkAlive(config.tribeId);
        console.log("======= check ws status at frontend: ", WsStatus[rest], WsStatus[isConnecting])
        if (rest !== isConnecting) {
            this.setState({
                isConnecting: rest
            })
        }

        if (rest == WsStatus.active && (!this.state.userLimit || (Math.floor(Date.now() / 1000)) % 9 == 0)) {
            const rest = await tribeService.userLimit(config.tribeId);
            config.userLimit = rest;
            if (!userLimit || userLimit.supportLeft != rest.supportLeft || userLimit.msgLeft != rest.msgLeft) {
                this.setState({userLimit: rest})
            }
        }
    }

    setShowMenusModal = (f: boolean) => {
        this.setState({
            showMenusModal: f
        })
    }

    initOwnerData = async () => {
        {
            const userLimit = await tribeService.userLimit(config.tribeId);
            config.userLimit = userLimit;
            this.setState({userLimit: userLimit})
        }
    }

    showShareModal = async () => {
        const {roles} = this.state;

        const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, 1, 20)
        const latestMgs: Array<Message> = [];
        for (let ps of rest.data) {
            latestMgs.push(...ps.records)
        }
        // if (messages && messages.length > 0 && messages[0].records.length > 0) {
        //     for(let msg of messages[0].records){
        //         if (latestMgs.length >= 10) {
        //             break;
        //         }
        //         const m = JSON.parse(JSON.stringify(msg))
        //         m.actor = roles.find(role=>role.id == m.role)
        //         latestMgs.push(m)
        //     }
        // }
        // if (latestMgs.length < 10) {
        //     const groupIds = await tribeService.groupIds(config.tribeId);
        //     for (let groupId of groupIds) {
        //         if (latestMgs.length >= 10) {
        //             break;
        //         }
        //         const groupMsg = await tribeService.groupedMsg([groupId]);
        //         if (groupMsg && groupMsg.length > 0 && groupMsg[0].records.length > 0) {
        //             for(let msg of groupMsg[0].records){
        //                 if (latestMgs.length >= 10) {
        //                     break;
        //                 }
        //                 const m = JSON.parse(JSON.stringify(msg))
        //                 m.actor = groupMsg[0].roles.find(role=>role.id == m.role)
        //                 latestMgs.push(m)
        //             }
        //         }
        //     }
        // }
        this.setState({showShare: true, latestMgs: latestMgs})
    }

    initData = async () => {
        const {tribeId} = this.props;
        const account = await emitBoxSdk.getAccount();
        const tribeInfo = await tribeService.tribeInfo(tribeId);
        const owner = account && account.addresses && account.addresses[ChainType.EMIT.valueOf()]
        const f = await tribeService.isSessionAvailable()

        const buttons = [{
            text: 'Verse',
            icon: addOutline,
            handler: () => {
                console.log('Share clicked');
                this.setShowCreateTribe(true)
            }
        }, {
            text: 'Share',
            icon: share,
            handler: () => {
                console.log('Share clicked', navigator.share);
                // Share.canShare().then(f => console.log(f, "can share ?"))
                this.showShareModal();
            }
        }, {
            text: 'Cancel',
            icon: close,
            role: 'cancel',
            handler: () => {
                console.log('Cancel clicked');
            }
        }]
        if (owner == tribeInfo.keeper) {
            buttons.unshift({
                text: 'Pin',
                icon: pinOutline,
                handler: () => {
                    this.setShowPin(true)
                }
            }, {
                text: 'Dye',
                icon: colorPaletteOutline,
                handler: () => {
                    this.setShowTribeEdit(true)
                    console.log('Favorite clicked');
                }
            })
        }
        const roles = await tribeService.tribeRoles(tribeId);
        const groupIds = await tribeService.groupIds(tribeId);
        const groupTribes = await tribeService.groupedMsg(groupIds);
        //
        // await tribeService.setCacheMsg(tribeId,undefined,roles,groupIds);
        groupTribes.push({
            theme: tribeInfo.theme,
            records: [],
            roles: roles
        })
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

        this.setState({
            account: account,
            owner: owner,
            buttons: buttons,
            tribeInfo: tribeInfo,
            defaultTheme: tribeInfo.theme,
            roles: roles,
            latestRole: role,
            groupMsgs: groupTribes,
            isSessionAvailable: f
        })
    }

    setShowLoading = (f: boolean) => {
        this.setState({showLoading: f})
    }

    onSendMsg = async (msg: Message) => {
        msg.id = this.props.tribeId;
        // await tribeService.pushTribe(msg)
        // const messagesCopy = [...data];
        // messagesCopy.push(msg);
        // this.setState({
        //     data: messagesCopy
        // })
    }

    setLatestRole = (v: TribeRole) => {
        this.setState({
            latestRole: v
        })
        selfStorage.setItem("latestRoleId", v.id)
    }

    setShowActionSheet = (f: boolean) => {
        this.setState({
            showActionSheet: f
        })
    }

    setShowTribeEdit = (f: boolean) => {
        this.setState({
            showTribeEdit: f,
        })
    }

    onSupport = async (msgId: string, f: boolean) => {
        const {userLimit} = this.state;
        if (userLimit && userLimit.supportLeft <= 0) {
            return Promise.reject(`reaching the max number(${userLimit.maxSupportCount})`)
        }
        await tribeService.msgSupport(msgId, f)
    }

    setShowPin = (f: boolean) => {
        this.setState({
            showPin: f
        })
    }

    onShowVisibleTheme = (v: PinnedSticky) => {
        this.setState({
            defaultTheme: v.theme
        })
    }

    showPinnedMsgDetail = async (groupId: string) => {
        const rest = await tribeService.groupedMsg([groupId], true);
        const ret = tribeService.convertGroupMsgToPinnedSticky(rest);
        this.setState({
            showPinnedMsgDetailModal: true,
            groupPinnedMsg: ret
        })
    }

    setShowCreateTribe = (f: boolean) => {
        this.setState({showCreateTribe: f})
    }

    setShowToast = (f: boolean, msg?: string) => {
        this.setState({showToast: f, toastMsg: msg})
    }

    render() {
        const {
            owner, showActionSheet, isSessionAvailable, buttons, toastMsg, showShare, latestMgs, showToast, showPinnedMsg, userLimit,
            showCreateTribe, isUpdating, isConnecting, groupMsgs, showMenusModal, groupPinnedMsg, showPinnedMsgDetailModal,
            account, roles, tribeInfo, latestRole, datas, showTribeEdit, showPin
        } = this.state;

        return (
            <>
                <IonRow style={{height: '100%'}}>
                    <IonCol sizeMd="8" sizeSm="12" sizeXs="12" style={{height: '100%'}}>
                        <IonMenu contentId="main-content">
                            <IonHeader>
                                <IonToolbar className="msg-toolbar">
                                    <IonMenuToggle>
                                        <div style={{paddingLeft: 12}}><IonIcon src={arrowBackOutline}/></div>
                                    </IonMenuToggle>
                                    <IonTitle>
                                        <img height={28} src="./assets/img/pins-logo.png"/>
                                    </IonTitle>
                                </IonToolbar>
                            </IonHeader>
                            <IonContent className="ion-padding">

                                <SideBar onRequestAccount={() => {
                                    tribeService.getAccountAndLogin().then(() => {
                                        this.initData().catch(e => console.error(e))
                                    }).catch(e => {
                                        const err = typeof e == 'string'?e:e.message;
                                        this.setShowToast(true,err)
                                        console.error(e)
                                    })
                                }} account={account} onLogout={() => {
                                    tribeService.userLogout().then(() => {
                                        this.initData().catch(e => console.error(e))
                                    }).catch(e => {
                                        const err = typeof e == 'string'?e:e.message;
                                        this.setShowToast(true,err)
                                        console.error(e)
                                    })
                                }} isSessionAvailable={isSessionAvailable}/>
                            </IonContent>
                        </IonMenu>

                        <IonPage id="main-content">
                            <IonHeader mode="ios" color="primary">
                                {
                                    showPin ? <IonToolbar className="msg-toolbar">
                                            <IonButtons slot="end">
                                                <IonButton onClick={() => {
                                                    this.setShowPin(false)
                                                }}>
                                                    Cancel
                                                </IonButton>
                                            </IonButtons>
                                            <IonTitle className="font-style-bold" onClick={() => {
                                                this.setShowMenusModal(true);
                                            }}>
                                                <TribeHeader onReladData={() => {
                                                    this.initData().catch(e => {
                                                        console.error(e)
                                                    })
                                                }} tribeInfo={tribeInfo} roles={roles} wsStatus={isConnecting}/>
                                            </IonTitle>
                                        </IonToolbar> :
                                        <IonToolbar className="msg-toolbar">
                                            <div className="msg-head-avatar">
                                                <div>
                                                    <div slot="start" id="main-content">
                                                        <IonMenuToggle>
                                                            <IonIcon src={listOutline} size="large"/>
                                                        </IonMenuToggle>
                                                    </div>

                                                    {/*{*/}
                                                    {/*    account && account.name ? <div slot="start" onClick={() => {*/}
                                                    {/*            tribeService.getAccountAndLogin().then(() => {*/}
                                                    {/*                this.initData().catch(e => console.error(e))*/}
                                                    {/*            }).catch(e => {*/}
                                                    {/*            })*/}

                                                    {/*        }}>*/}
                                                    {/*            <Avatar name={account.name} round size="30"/>*/}
                                                    {/*        </div> :*/}
                                                    {/*        <IonIcon size="large" slot="start" src={personCircleOutline}*/}
                                                    {/*                 onClick={() => {*/}
                                                    {/*                     tribeService.getAccountAndLogin().then(() => {*/}
                                                    {/*                         this.initData().catch(e => console.error(e))*/}
                                                    {/*                     }).catch(e => {*/}
                                                    {/*                     })*/}

                                                    {/*                 }}/>*/}
                                                    {/*}*/}
                                                </div>
                                            </div>
                                            <IonTitle className="font-style-bold" onClick={() => {
                                                this.setShowMenusModal(true);
                                            }}>
                                                <TribeHeader onReladData={() => {
                                                    this.initData().catch(e => {
                                                        console.error(e)
                                                    })
                                                }} tribeInfo={tribeInfo} roles={roles} wsStatus={isConnecting}/>
                                            </IonTitle>
                                            {/*<div slot="end" className="menus-list-button">*/}
                                            {/*    <IonIcon src={listOutline} color="medium" size="large" slot="end"*/}
                                            {/*             onClick={() => {*/}
                                            {/*                 this.setShowMenusModal(true)*/}
                                            {/*             }}/>*/}
                                            {/*</div>*/}
                                            <IonIcon src={ellipsisVertical} color="medium" size="large" slot="end"
                                                     onClick={(e) => {
                                                         e.stopPropagation();
                                                         this.setShowActionSheet(true)
                                                     }}/>
                                        </IonToolbar>
                                }

                            </IonHeader>
                            <IonContent fullscreen>
                                <div id="container">
                                    <div className="bottom"></div>
                                    <div className="top"></div>
                                </div>

                                <div className="msg-box">
                                    {
                                        isConnecting == WsStatus.tokenInvalid &&
                                        <div className="not-connect" onClick={() => {
                                            tribeService.getAccountAndLogin().then(() => {
                                                this.initData().catch(e => console.error(e))
                                            }).catch(e => {
                                            })

                                        }}><IonText color="primary">No connection , <span style={{
                                            textDecoration: "underline",
                                            textUnderlineOffset: '4px',
                                            cursor: "pointer"
                                        }}>login</span></IonText></div>
                                    }
                                    {
                                        isConnecting == WsStatus.inactive &&
                                        <div className="not-connect">Connecting...</div>
                                    }
                                    <div className="msg-toolbar">
                                        <ToolBar/>
                                        <ShareEx owner={owner} roles={roles} latestMsg={latestMgs} isOpen={showShare}
                                                 onClose={() => this.setState({showShare: false})}
                                                 tribeInfo={tribeInfo}/>
                                    </div>
                                    <MessageContentVisual
                                        loaded={!!tribeInfo}
                                        showPinnedMsgDetail={(groupId) => {
                                            this.showPinnedMsgDetail(groupId).catch(e => {
                                                console.log(e)
                                            })
                                        }}
                                        onReload={(loadOwnerOnly) => {
                                            if (loadOwnerOnly) {
                                                this.initOwnerData().catch(e => {
                                                    console.error(e)
                                                })
                                            } else {
                                                this.initData().catch(e => {
                                                    console.error(e)
                                                })
                                            }

                                        }}
                                        tribeInfo={tribeInfo}
                                        owner={owner}
                                        groupMsg={groupMsgs}
                                        onSupport={(msgId, f) => {
                                            this.onSupport(msgId, f).catch(e => {
                                                const err = typeof e == 'string' ? e : e.message;
                                                this.setShowToast(true, err)
                                            })
                                        }}
                                        showPin={showPin}
                                        userLimit={userLimit}
                                        selectRole={latestRole}
                                    />

                                    <BottomBar tribeInfo={tribeInfo} owner={owner} userLimit={userLimit}
                                               onRoleCheck={(v) => {
                                                   this.setLatestRole(v)
                                               }} roles={roles} selectRole={latestRole} showPin={showPin} onPin={() => {
                                        // tribeService.setCacheMsg(config.tribeId,[])
                                        this.setState({showPin: false, datas: []})
                                        this.initData().catch(e => {
                                            console.error(e)
                                        })
                                    }}/>


                                </div>


                                <IonActionSheet
                                    isOpen={showActionSheet}
                                    onDidDismiss={() => this.setShowActionSheet(false)}
                                    cssClass='my-custom-class'
                                    buttons={buttons}
                                >

                                </IonActionSheet>
                                {
                                    tribeInfo && <TribeEditModal isOpen={showTribeEdit}
                                                                 onClose={() => this.setShowTribeEdit(false)}
                                                                 onOk={(tribeId) => {
                                                                     this.setShowTribeEdit(false);
                                                                     this.initData().catch(e => {
                                                                         console.log(e)
                                                                     })

                                                                 }} tribeInfo={tribeInfo}/>
                                }
                                <TribeEditModal isOpen={showCreateTribe} onClose={() => this.setShowCreateTribe(false)}
                                                onOk={(tribeId) => {
                                                    this.setShowCreateTribe(false)
                                                    window.open(`./${tribeId}`)
                                                }}/>

                                <IonToast
                                    isOpen={showToast}
                                    onDidDismiss={() => this.setShowToast(false)}
                                    message={toastMsg}
                                    position="top"
                                    color={"danger"}
                                    duration={2000}
                                />

                            </IonContent>
                        </IonPage>
                    </IonCol>
                    <IonCol sizeMd="4" sizeSm="12" sizeXs="12" style={{padding: "unset", height: '100%'}}>
                        <RoleListModal
                            groupMsg={groupMsgs} tribeInfo={tribeInfo} roles={roles} defaultRole={latestRole}
                            onRoleCheck={v => this.setLatestRole(v)}
                            onReloadList={() => {
                                setTimeout(() => {
                                    this.initData().catch(e => {
                                        console.error(e)
                                    })
                                }, 500)
                            }}/>

                    </IonCol>
                </IonRow>
                {/*<IonLoading*/}
                {/*    cssClass='my-custom-class'*/}
                {/*    isOpen={isConnecting == WsStatus.inactive}*/}
                {/*    onDidDismiss={() => this.setState({isConnecting: WsStatus.active})}*/}
                {/*    message={'Connecting...'}*/}
                {/*    duration={60000}*/}
                {/*/>*/}
                <PinnedMsgModal isOpen={showPinnedMsgDetailModal} onClose={() => {
                    this.setState({showPinnedMsgDetailModal: false})
                }} data={{data: groupPinnedMsg, total: groupPinnedMsg.length}} tribeInfo={tribeInfo}/>


            </>
        );
    }
}