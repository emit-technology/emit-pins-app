import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../../common/state/app/hooks";
import {saveDataState} from '../../common/state/slice/dataSlice';
import {
    IonIcon,
    IonItem,
    IonLabel,
    IonText,
    IonRow,
    IonCol,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle, IonMenuToggle, IonHeader
} from "@ionic/react";
import {Message, MessageStatus, PinnedSticky, TribeInfo, TribeRole, TribeTheme, WsStatus} from "../../types";
import tribeWorker from "../../worker/imWorker";
import config from "../../common/config";
import {chevronBackOutline, chevronForwardOutline, ellipsisVertical, listOutline} from "ionicons/icons";
import BigNumber from "bignumber.js";
import {tribeService} from "../../service/tribe";
import {TribeInfoModal} from "./TribeInfoModal";
import {utils} from "../../common";
import {saveMessageState} from "../../common/state/slice/messageSlice";

interface Props {
    tribeInfo: TribeInfo;
    roles: Array<TribeRole>;
    wsStatus: WsStatus;
    onReladData?: () => void;

    stickyMsg?: PinnedSticky

    showPin: boolean;
    onCancelShowPin: () => void;

    setShowActionSheet: (f: boolean) => void;
}

const TribeHeaderChild: React.FC<Props> = ({tribeInfo, showPin, onCancelShowPin, setShowActionSheet, onReladData,  roles, wsStatus}) => {

    const [showTribeInfoModal, setShowTribeInfoModal] = useState(false);
    const [stickies, setStickies] = useState({data: [], total: 0});
    const [stickyMsg, setStickyMsg] = useState(null);

    const [isUp, setIsUp] = useState(false);


    const dispatchData = useAppSelector(state => state.jsonData);
    const dispatch = useAppDispatch();

    const dispatchMessage = useAppSelector(state => state.messageData);

    const onClickThemeBack = useCallback(() => {
        if (stickyMsg) {
            const index = tribeService.groupIdCache().findIndex(v => v == stickyMsg.groupId)
            if (index > 0) {
                const preGroupId = tribeService.groupIdCache()[index - 1];
                if(!preGroupId){
                    setStickyMsg({
                        theme: tribeInfo && tribeInfo.theme,
                        seq: index,
                        roles: [],
                        records: [],
                        groupId: preGroupId,
                        index: -1
                    })
                }else{
                    tribeService.groupedMsg([preGroupId]).then(rest=>{
                        const groupMsg = rest[0];
                        setStickyMsg({
                            theme: groupMsg.theme,
                            seq: index,
                            roles: [],
                            records: [],
                            groupId: preGroupId,
                            index: index
                        })
                    })
                }


                tribeService.getMsgPositionWithGroupId(tribeService.groupIdCache()[index - 1]).then(postion => {
                    // onChangeMsgIndex(postion)
                    dispatch(saveDataState({
                        data: {firstIndex: postion},
                        tag: 'setFirstIndex'
                    }))
                })
            }
        }
    }, [stickyMsg])


    const onClickThemeForward = useCallback(() => {
        if (stickyMsg ) {
            const index = tribeService.groupIdCache().findIndex(v => v == stickyMsg.groupId)
            if (index < tribeService.groupIdCache().length - 1) {

                const preGroupId = tribeService.groupIdCache()[index + 1];
                if(!preGroupId){
                    setStickyMsg({
                        theme: tribeInfo && tribeInfo.theme,
                        seq: -1,
                        roles: [],
                        records: [],
                        groupId: preGroupId,
                        index: -1
                    })
                }else{
                    tribeService.groupedMsg([preGroupId]).then(rest=>{
                        console.log(rest,"rest")
                        const groupMsg = rest[0];
                        setStickyMsg({
                            theme: groupMsg.theme,
                            seq: index + 2,
                            roles: [],
                            records: [],
                            groupId: preGroupId,
                            index: index + 2
                        })
                    })
                }


                tribeService.getMsgPositionWithGroupId(tribeService.groupIdCache()[index + 1]).then(postion => {
                    dispatch(saveDataState({
                        data: {firstIndex: postion},
                        tag: 'setFirstIndex'
                    }))
                })
            }
        }
    }, [stickyMsg])

    const fetch = async () => {
        if (tribeInfo) {
            if (!stickyMsg || !stickyMsg.groupId) {
                const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, tribeService.getGroupStatic().total - tribeService.getGroupStatic().groupNum.find(v => v.groupId == "").num, 100000)
                const data = rest.data.filter(v => v.records && (v.records.length > 0 && v.records[0].msgStatus !== MessageStatus.removed || v.records.length == 0));
                setStickies({data: data, total: data.length})
            } else {
                if (stickyMsg && stickyMsg.groupId) {
                    const rest = await tribeService.groupedMsgRemove([stickyMsg.groupId], true);

                    if (rest && rest.length > 0) {
                        const data = await tribeService.convertGroupMsgToPinnedSticky(rest)
                        if (data && data.length > 0) {
                            data[0].seq = stickyMsg.seq;
                        }
                        setStickies({data: data, total: data.length})
                    }
                }

            }
        }
    }

    useEffect(() => {
        if (dispatchMessage) {
            if (dispatchMessage.tag == 'updateThemeHead' && dispatchData.data) {
                let dataObj: any = dispatchMessage.data;
                if (dataObj.stickyMsg) {
                    setStickyMsg(dataObj.stickyMsg)
                }

            }
        }
    }, [dispatchData.data]);


    // useEffect(() => {
    //     if (dispatchMessage) {
    //         if (dispatchMessage.tag == 'isScrollDown' && dispatchMessage.data) {
    //             let dataObj: any = dispatchMessage.data;
    //             setIsUp(dataObj.isScrollDown);
    //             // if (dataObj.isScrolling) {
    //             // dispatch(saveMessageState({data: {isScrolling:false  }, tag: 'isScrolling'}))
    //             // }
    //
    //         }
    //     }
    // }, [dispatchMessage.data]);


    return <>
        {/* className={"display-animation"} style={{height: !isUp && utils.isApp()?"1px":"auto"}}*/}
        {
          <IonHeader mode="ios" color="primary">
                <IonToolbar className="msg-toolbar">
                    <div className="msg-head-avatar">
                        <div slot="start" id="main-content-left">
                            <IonMenuToggle menu="start" autoHide={false}>
                                <IonIcon src={listOutline} size="large"/>
                            </IonMenuToggle>
                        </div>
                    </div>
                    <IonTitle className="font-style-bold">
                        {
                            stickyMsg && <div className="head-item">
                                <div style={{cursor: "pointer", width: "100%"}}>
                                    <IonRow>
                                        <IonCol size="2">
                                            <div className="head-icons">
                                                {
                                                    stickyMsg && tribeService.groupIdCache().indexOf(stickyMsg.groupId) > 0
                                                    && <IonIcon src={chevronBackOutline} size="large" color="medium"
                                                                onClick={onClickThemeBack}/>
                                                }
                                            </div>
                                        </IonCol>
                                        <IonCol size="8">
                                            <div className="head-box">
                                                <div>
                                                    <div  className="head-reg" style={{ backgroundImage: (stickyMsg && stickyMsg.theme && stickyMsg.theme.image || tribeInfo && tribeInfo.theme) ?
                                                            `url(${utils.getDisPlayUrl(stickyMsg && stickyMsg.groupId ? stickyMsg.theme.image : tribeInfo && utils.getDisPlayUrl(tribeInfo.theme.image))})`:""

                                                    }} onClick={() => {
                                                        fetch().then(() => {
                                                            setShowTribeInfoModal(true)
                                                        }).catch(e => console.error(e))
                                                    }}>
                                                        {/*{*/}
                                                        {/*    (stickyMsg && stickyMsg.theme && stickyMsg.theme.image || tribeInfo && tribeInfo.theme)*/}
                                                        {/*    && <img className="head-reg" width="100%" height="100%"*/}
                                                        {/*            src={utils.getDisPlayUrl(stickyMsg && stickyMsg.groupId ? stickyMsg.theme.image : tribeInfo && utils.getDisPlayUrl(tribeInfo.theme.image))}*/}
                                                        {/*            style={{borderRadius: 6, objectFit: 'cover'}}/>*/}
                                                        {/*}*/}
                                                    </div>
                                                    <div className="headxs" onClick={() => {
                                                        fetch().then(() => {
                                                            setShowTribeInfoModal(true)
                                                        }).catch(e => console.error(e))
                                                    }}>
                                                        <div className="head-pin-title">{tribeInfo && tribeInfo.title}</div>
                                                        <div style={{overflow: "hidden"}} className="head-sub">
                                    <span style={{fontSize: '11px', color: "#92949c"}}>
                                    {
                                        (stickyMsg && stickyMsg.groupId ? `#${stickyMsg.seq} ${(stickyMsg as PinnedSticky).theme.themeTag}` : tribeInfo && tribeInfo.theme.themeTag)
                                    }
                                        </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </IonCol>
                                        <IonCol size="2">
                                            <div className="head-icons2">
                                                {
                                                    stickyMsg && tribeService.groupIdCache().indexOf(stickyMsg.groupId) < tribeService.groupIdCache().length - 1
                                                    && <IonIcon src={chevronForwardOutline} size="large" color="medium"
                                                                onClick={onClickThemeForward}/>
                                                }
                                            </div>
                                        </IonCol>
                                    </IonRow>


                                </div>
                            </div>
                        }
                    </IonTitle>
                    {
                        showPin ? <IonButtons slot="end">
                            <IonButton onClick={() => {
                                onCancelShowPin()
                            }}>
                                Cancel
                            </IonButton>
                        </IonButtons> : <IonIcon src={ellipsisVertical} color="medium" size="large" slot="end"
                                                 onClick={(e) => {
                                                     e.persist();
                                                     setShowActionSheet(true)
                                                 }}/>
                    }
                </IonToolbar>
            </IonHeader>
        }

        <TribeInfoModal onReladData={onReladData} isOpen={showTribeInfoModal} stickies={stickies}
                        onClose={() => setShowTribeInfoModal(false)} tribeInfo={tribeInfo} roles={roles}
                        stickyMsg={stickyMsg}/>
    </>
}

export const TribeHeader = React.memo(TribeHeaderChild)