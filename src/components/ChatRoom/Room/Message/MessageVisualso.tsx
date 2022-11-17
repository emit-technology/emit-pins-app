import * as React from 'react';
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
    GroupMsg,
    Message,
    MessageStatus,
    MessageType,
    PinnedSticky,
    TribeInfo,
    TribeRole,
    UserLimit
} from "../../../../types";
import {Dice, Expression, Text} from "./Types";

import './message.scss';
import {useAppDispatch, useAppSelector} from "../../../../common/state/app/hooks";
// import useVirtual from "react-cool-virtual";
import {saveDataState} from "../../../../common/state/slice/dataSlice";
import {
    IonAvatar,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonIcon, IonSkeletonText,
    IonItem, IonThumbnail,
    IonFab,
    IonHeader,
    IonLabel,
    IonLoading,
    IonModal,
    IonRow,
    IonTextarea,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {
    arrowForwardOutline,
    chevronDownOutline,
    chevronUpOutline,
    createOutline,
    gitBranchOutline, scaleOutline
} from "ionicons/icons";
import {tribeService} from "../../../../service/tribe";
import UploadImage from "../../../utils/UploadImage";
import add from "../../../../img/add.png";
import config from "../../../../common/config";
import tribeWorker from "../../../../worker/imWorker";
import BigNumber from "bignumber.js";
import selfStorage from "../../../../common/storage";
import {Tools} from "./Types/Tools";
import {utils} from "../../../../common";
import {ShareEx} from "../../../utils/ShareEx";
import {ReplayText} from "./Types/ReplayText";
import {StatusBar} from "@capacitor/status-bar";
import {isApp} from "../../../../service/app";
import {Virtuoso} from 'react-virtuoso'
import {MsgStaticInfo} from "../../../../../../emit-im-worker/src/types";

interface Props {
    pinnedStickies?: { data: Array<PinnedSticky>, total: number }
    tribeInfo: TribeInfo;
    owner: string; // address
    onSupport?: (msgId: string, f: boolean) => void;
    showPin?: boolean
    showPinnedMsgDetail?: (groupId: string) => void;
    onReload?: (loadOwnerOnly: boolean) => void;
    loaded?: boolean
    groupMsg?: Array<GroupMsg>
    userLimit?: UserLimit
    selectRole?: TribeRole
    shareMsgId?: string
    onFork?: (groupId: string, forkTribeInfo: TribeInfo) => Promise<string>;

    setHideMenu?: (f: boolean) => void;
}

const pageSize = 100;
let pageNo = 1;
let count = 0;
let total = 0;
let shouldScroll = 0;
let error_fetch_count = 0;
let shouldScrollToBottom = false;

let delaySaveCurrentVisibleIndex = 0;

const mutexify = require('mutexify/promise')
const _lock = mutexify()

function setCurrentVisible(visibleStartMsgId: string) {
    selfStorage.setItem(`current_visible_index_${config.tribeId}`, visibleStartMsgId)
}

let visibleStartMsgId = "";

const setVisibleStartIndex = (pinMsg: PinnedSticky) => {
    visibleStartMsgId = pinMsg && pinMsg.records && pinMsg.records.length > 0 && pinMsg.records[0].id;
}

export const MessageContentVisualso: React.FC<Props> = ({groupMsg, setHideMenu, onFork, shareMsgId, userLimit, selectRole, pinnedStickies, loaded, onReload, showPinnedMsgDetail, showPin, owner, tribeInfo, onSupport}) => {
    const dispatchData = useAppSelector(state => state.jsonData);
    const dispatch = useAppDispatch();
    const [comments, setComments] = useState([]);
    const [showModifyMsg, setShowModifyMsg] = useState(null);

    const [showShareModal, setShowShareModal] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [shareMsgs, setShareMsgs] = useState([]);
    const [shareRoles, setShareRoles] = useState([]);

    const [stickyMsg, setStickyMsg] = useState(null);
    const [checkedMsgArr, setCheckedMsgArr] = useState([])
    const [currentVisibleStopIndex, setCurrentVisibleStopIndex] = useState(0);
    const [maxVisibleIndex, setMaxVisibleIndex] = useState(0);
    const [replayMsg, setReplayMsg] = useState(null);
    const [checkedMsgId, setCheckedMsgId] = useState("");
    // const [scrollEvent, setScrollEvent] = useState(null);
    const virtuoso = useRef(null);

    const [firstItemIndex, setFirstItemIndex] = useState(0)

    useEffect(() => {
        if (!pinnedStickies && comments.length == 0 && tribeInfo) {
            dispatchTheme({
                roles: tribeInfo.roles,
                theme: tribeInfo.theme,
                records: [], index: 0, groupId: "", seq: -1
            })
        }
    }, [tribeInfo])

    const getCurrentVisible = (): number => {
        const msgId = selfStorage.getItem(`current_visible_index_${config.tribeId}`);
        const index = comments.findIndex(v => (v as PinnedSticky).records && (v as PinnedSticky).records.length > 0 && (v as PinnedSticky).records[0].id == msgId);
        return index == -1 ? 999999999 : index;
    }


    const initLatestPin = async () => {
        const msgGroups = await tribeService.groupIds(config.tribeId);
        if(msgGroups && msgGroups.length>0){
            // const preGroupId = msgGroups[msgGroups.length - 1];
            const preGroupId = msgGroups[5];
            console.log("preGroup2: ", preGroupId)
            // const msgCountInfo = await tribeService.msgGrouedInfo(msgId)
            if(preGroupId){
                const groupMsg:Array<GroupMsg> = await tribeService.groupedMsg([preGroupId])
                const rest = tribeService.convertMessagesToPinnedSticky(groupMsg[0].records,groupMsg[0].roles,groupMsg[0].theme)
                setComments((prev)=> [...rest, ...prev])
            }
        }
    }


    const loadPrevPin = async (groupId:string) => {
        console.log("load pre --> ", groupId)
        const msgGroups = await tribeService.groupIds(config.tribeId);

        const groupMsgIndex = msgGroups.findIndex(value => value == groupId);
        console.log("load pre groupMsgIndex--> ", groupMsgIndex)
        if(groupMsgIndex){
            const preGroup = msgGroups[groupMsgIndex - 1];
            // const msgCountInfo = await tribeService.msgGrouedInfo(msgId)
            if(preGroup){
                const groupMsg:Array<GroupMsg> = await tribeService.groupedMsg([preGroup], false)
                const rest = tribeService.convertMessagesToPinnedSticky(groupMsg[0].records,groupMsg[0].roles,groupMsg[0].theme)
                console.log("load pre rest--> ", rest)
                setComments((prev)=> [...rest, ...prev])
            }
        }
    }

    const loadNextPin = async (groupId:string) => {
        const msgGroups = await tribeService.groupIds(config.tribeId);
        const groupMsgIndex = msgGroups.findIndex(value => value == groupId);
        if(groupMsgIndex && msgGroups.length > groupMsgIndex + 1){
            const nextGroup = msgGroups[groupMsgIndex + 1];
            // const msgCountInfo = await tribeService.msgGrouedInfo(msgId)
            if(nextGroup){
                const groupMsg:Array<GroupMsg> = await tribeService.groupedMsg([nextGroup])
                const rest = tribeService.convertMessagesToPinnedSticky(groupMsg[0].records,groupMsg[0].roles,groupMsg[0].theme)
                setComments((prev)=> [...prev, ...rest])
            }
        }
    }

    const fetchData = async (pageNo, condition?: Array<any>) => {

        try {
            // // pageNo = pageNo < 1 ? 1 : pageNo;
            // console.log("fetch data total == %d ,page=%d", total, pageNo)
            // const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, pageNo, pageSize, condition)
            // // total = rest.data.length;
            // total = rest.total;
            // console.log("fetch data =========> ", rest)
            // // Pre-pend new items
            // setComments((prevComments: Array<PinnedSticky>) => [...rest.data, ...prevComments]);
            // setComments(rest.data)
        } catch (err) {
            // if (error_fetch_count++ < 50) {
            //     await fetchData(pageNo);
            // }
            console.error(err, "fetchData error")
            // Try again
        }
    };

    const doScrollEvent = async (e: { visibleStartIndex: number, visibleStopIndex: number }) => {
        try {
            // const e = scrollEvent;
            setVisibleRange([e.visibleStartIndex, e.visibleStopIndex])
            if (e) {
                if (!pinnedStickies) {
                    setVisibleStartIndex(comments[e.visibleStartIndex]);
                    setCurrentTimeout(false);
                }
                if (!pinnedStickies && currentVisibleStopIndex !== e.visibleStopIndex) {
                    setCurrentVisibleStopIndex(e.visibleStopIndex);
                    if (e.visibleStopIndex >= maxVisibleIndex) {
                        setMaxVisible(e.visibleStopIndex);
                    }
                    const data = comments[e.visibleStartIndex + 1];

                    if (e.visibleStopIndex >= comments.length) {
                        const data = comments[e.visibleStopIndex];
                        displayBottomMsg(data);
                    } else if (e.visibleStartIndex == 0) {
                        const data = comments[e.visibleStartIndex];
                        dispatchTheme(data);
                    } else {
                        // const condition = data && stickyMsg && (stickyMsg.seq != data.seq);
                        if (!stickyMsg && data || stickyMsg && data && (stickyMsg.seq != data.seq)) {
                            dispatchTheme(data);
                        }
                    }

                }
            }
        } catch (e) {
            console.error(e)
        } finally {
        }
    }

    const setStatusBarHide = async (f: boolean) => {
        if (!await isApp()) {
            return;
        }
        if (f) {
            StatusBar.hide().catch(e => console.error(e))
        } else {
            StatusBar.show().catch(e => console.error(e))
        }

    }

    const setFullScreen = (scrollForward: boolean) => {
        try {
            if (!!setHideMenu && (utils.isAndroid() || utils.isIos())) {
                if (scrollForward) {
                    setHideMenu(true)
                    setStatusBarHide(true)
                } else {
                    setHideMenu(false)
                    setStatusBarHide(false)
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    const setCurrentTimeout = (scrollForward: boolean) => {
        if (visibleStartMsgId && delaySaveCurrentVisibleIndex++ == 0) {
            setTimeout(() => {
                setCurrentVisible(visibleStartMsgId);
                delaySaveCurrentVisibleIndex = 0;
            }, 10)
        }
    }

    const prependItems = useCallback(() => {
        console.log("=========prependItems >> ", firstItemIndex, pageNo)
        if (pageNo >= 1 && firstItemIndex > pageSize) {
            const nextFirstItemIndex = firstItemIndex - pageSize
            setFirstItemIndex(() => nextFirstItemIndex)
            fetchData(pageNo).catch(e => console.log(e))
        }
        return false
    }, [firstItemIndex, comments, setComments])

    useEffect(() => {
        if (document.hidden !== undefined && !pinnedStickies) {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    console.log("fetch page data")
                    fetchData(pageNo)
                }
            })
        }
    }, [])

    useEffect(() => {
        console.log("init component ...")
        if (!pinnedStickies) {
            {
                const max = selfStorage.getItem(`maxVisibleIndex_${config.tribeId}`);
                setMaxVisibleIndex(max ? max : 0)
            }

            if (loaded && count++ == 0) {
                shouldScrollToBottom = true;
                {
                    initLatestPin().catch(e=>console.error(e))

                    fetchData(pageNo).then(() => {
                        //
                        // setTimeout(()=>{
                        //     scrollToBottom();
                        // },1000)
                    }).catch(e => console.error(e))
                }

                tribeWorker.addMessageListener(config.tribeId, (messages: Array<PinnedSticky>) => {

                    if (!document.hidden) {
                        setComments((preComments) => {
                            const nextComments = [];
                            let commentsCopy: Array<PinnedSticky> = [...preComments];
                            for (let index = 0; index < messages.length; index++) {
                                const comment = messages[index];

                                // remove all unpinned msg when pin type
                                if (comment && comment.records && comment.records.length > 0 && comment.records[0].msgType == MessageType.Pin) {
                                    // commentsCopy = commentsCopy.filter(v => v.groupId !== "")
                                    // fetchNewPin(groupMsg,pageNo,setComments).then(()=>{
                                    //     onReload(false);
                                    // }).catch(e=>console.error(e))
                                    {
                                        fetchData(pageNo).then(() => {
                                            onReload(false)
                                            // scrollToBottom();
                                        }).catch(e => console.error(e))
                                    }
                                } else if (comment.records && comment.records.length > 0 && comment.records[0].msgType == MessageType.UpdateTribe) {
                                    // if(total == 0){
                                    //     fetchData(pageNo)
                                    // }
                                    onReload(false);
                                } else {
                                    const _index = commentsCopy.findIndex(v => (v.records && v.records.length > 0 && comment && comment.records && comment.records.length > 0 && v.records[0].id == comment.records[0].id))
                                    //new message
                                    if (_index == -1) {
                                        if (comment.records && comment.records[0].msgStatus !== MessageStatus.removed) {
                                            if (commentsCopy.length > 0) {

                                                const latest: PinnedSticky = commentsCopy[commentsCopy.length - 1];
                                                const latestSeq = new BigNumber(comment.records && comment.records.length > 0 && comment.records[0].seq);
                                                if (new BigNumber(latest.records && latest.records.length > 0 && latest.records[0].seq).comparedTo(
                                                    latestSeq
                                                ) == -1) {
                                                    nextComments.push(comment)
                                                    total++
                                                } else {
                                                    const index = commentsCopy.findIndex(msg => msg.records && msg.records.length > 0 && new BigNumber(msg.records[0].seq).comparedTo(latestSeq) == 1)
                                                    if (index > -1) {
                                                        commentsCopy.splice(index, 1, ...[comment, commentsCopy[index]])
                                                    }
                                                }
                                            } else {
                                                nextComments.push(comment)
                                            }
                                        }
                                    } else {
                                        //removed
                                        if (comment.records && comment.records.length > 0 && comment.records[0].msgStatus == MessageStatus.removed) {
                                            if (commentsCopy[_index + 1] && commentsCopy[_index + 1].records && commentsCopy[_index + 1].records.length > 0) {
                                                const pinMsg: PinnedSticky = JSON.parse(JSON.stringify(commentsCopy[_index + 1]));
                                                pinMsg.records[0].hideTime = 0;
                                                commentsCopy.splice(_index + 1, 1, pinMsg)
                                            }
                                            commentsCopy.splice(_index, 1)
                                            total--;
                                        } else { //support or edit
                                            commentsCopy.splice(_index, 1, comment);
                                            total++
                                        }
                                    }
                                }

                                if (comment.records && comment.records.length > 0 && comment.records[0].msgType == MessageType.Role) {
                                    onReload(false);
                                }

                                if (comment.records && comment.records.length > 0 && comment.records[0].owner == owner) {
                                    onReload(true);
                                }

                            }
                            // console.log(commentsCopy,"commentsCopy>>>");
                            return [...commentsCopy, ...nextComments]
                        })
                    }

                    // setNewMsgs((preComments) => {
                    //     return [...preComments, ...nextComments]
                    // })

                });

            }
        } else {
            setComments(pinnedStickies.data)
        }
    }, [loaded])

    const dispatchTheme = async (data: PinnedSticky) => {
        const release = await _lock()
        try {
            setStickyMsg(data)
            dispatch(saveDataState({
                data: {stickyMsg: data, stickyMsgTop: data},
                tag: 'updateTheme'
            }))
        } catch (e) {
            console.error(e)
        } finally {
            release()
        }
    }

    const startItem = (index: number) => {
        virtuoso.current.scrollToIndex({
            index: index,
            align: "start",
            behavior: "auto"
        })
    }

    const scrollToItem = (data: { index: number, align: string }) => {
        virtuoso.current.scrollToIndex({
            index: data.index,
            align: data.align,
            behavior: "auto"
        })
    }

    useEffect(() => {
        if (!pinnedStickies && comments.length > 0) {
            console.log("scroll to last visit max=[%d], current=[%d] ", maxVisibleIndex, currentVisibleStopIndex)
            if (shouldScroll++ == 0) {
                const lastId = comments.findIndex(value => (value as PinnedSticky).records && (value as PinnedSticky).records && (value as PinnedSticky).records.length > 0 && (value as PinnedSticky).records[0].id == shareMsgId);
                const last = shareMsgId ? lastId - 1 : getCurrentVisible();
                console.log("scroll to last: ", last)
                if (last >= 0) {
                    setTimeout(() => {
                        if (last == 999999999) {
                            const itm = comments.length - 1;
                            const data = comments[itm];
                            // setStickyMsg(data)
                            dispatchTheme(data);
                            startItem(itm);
                        } else {
                            // const itm = last > 1 ? last + 1 : last;
                            const data = comments[last];
                            // setStickyMsg(data)
                            dispatchTheme(data);
                            // startItem(last);
                            setFirstItemIndex(last);
                        }

                    }, 100)
                } else {
                    setTimeout(() => {
                        scrollToBottom();
                    }, 100)
                }
            } else {
                if (currentVisibleStopIndex >= comments.length - 5 || shouldScrollToBottom) {
                    setTimeout(() => {
                        scrollToBottom();
                    }, 100)
                }
            }

        } else {

        }
    }, []);

    //TODO
    // }, [comments.length]);

    // useEffect(() => {
    // if (!stickyMsg  && total > 0) {
    //     const data = comments[0];
    //     setStickyMsg(data)
    //     // console.log("set data 5")
    //     dispatchTheme(data);
    // }

    // if(comments && total >0){
    //     const msg:PinnedSticky = comments[total - 1];
    //     if(msg && msg.records && msg.records.length>0){
    //         const record = msg.records[0];
    //         if(record.msgType !== MessageType.Role && record.msgType !== MessageType.Divide){
    //             groupByTime = {timestamp: record.timestamp, role: record.role}
    //         }
    //     }
    // }

    // }, [total])


    const onReplay = (msg: Message) => {
        if (owner) {
            setReplayMsg(msg)
            dispatch(saveDataState({data: JSON.stringify({msg: msg}), tag: 'replayMsg'}))
        }
    }

    const goToTheme = (seq: number, forward: any) => {
        const index = comments.findIndex(v => v.seq == seq)
        if (index > -1) {
            const startIndex = comments.findIndex((v:PinnedSticky)=>v.records && v.records.length>0 && v.records[0].id == visibleStartMsgId)
            if (forward && forward == 1 && index > startIndex) {
                goToTheme(seq - 1, forward)
            }
                // else if( forward && forward == 2 && index < currentVisibleIndex ){
                //     goToTheme(seq + 1, forward)
            // }
            else {
                dispatchTheme(comments[index])
                startItem(index);
                scrollToItem({index: index, align: "start"})
            }
        } else {
            scrollToBottom();

        }
    }

    useLayoutEffect(() => {
        if (!pinnedStickies && dispatchData) {
            if (dispatchData.tag == 'scrollToItem' && dispatchData.data) {
                let dataObj = JSON.parse(dispatchData.data);
                if (dataObj.refresh > -1) {
                    if (dataObj.refresh == 0) {
                        shouldScrollToBottom = true;
                        // scrollToBottom();
                    } else if (dataObj.refresh == 9999999) {
                        const index = comments.findIndex(v => ((v as PinnedSticky).records && (v as PinnedSticky).records.length > 0 && (v as PinnedSticky).records[0].groupId == ""))
                        if (index > 0) {
                            startItem(index);
                            scrollToItem({index: index, align: "start"})
                        } else {
                            shouldScrollToBottom = true;
                            scrollToBottom();
                        }
                    } else if (dataObj.refresh == 666666) {
                        const index = comments.findIndex(v => v.groupId == "")
                        if (index > 0) {
                            goToTheme(comments[index - 1].seq, dataObj["forward"]);
                            //
                            // const index2 = comments.findIndex(v => v.seq == comments[index - 1].seq)
                            // // console.log(index,index2,comments[index - 1].seq);
                            // if (index2 > -1) {
                            //     startItem(index2);
                            // }
                        } else {
                            scrollToBottom();
                        }
                    } else {
                        goToTheme(dataObj.refresh, dataObj["forward"]);
                    }
                }
                dispatch(saveDataState({data: JSON.stringify({refresh: -1}), tag: 'scrollToItem'}))
            } else if (dispatchData.tag == 'checkedAllMsg' && dispatchData.data) {
                let dataObj = JSON.parse(dispatchData.data);
                if (dataObj.refresh) {
                    if (dataObj.checked) {
                        const copy = [...comments];
                        const tmp = [];
                        copy.forEach(v => {
                            if (v.records && v.records.length > 0) {
                                tmp.push(v.records[0].id)
                            }
                        })
                        setCheckedMsgArr(tmp)
                        selfStorage.setItem(`tribe_pin_arr`, tmp)
                    } else {
                        setCheckedMsgArr([])
                        selfStorage.setItem(`tribe_pin_arr`, [])
                    }
                }
                dispatch(saveDataState({data: JSON.stringify({refresh: false, checked: false}), tag: 'checkedAllMsg'}))
            } else if (dispatchData.tag == 'replayMsg' && dispatchData.data) {
                let dataObj = JSON.parse(dispatchData.data);
                if (!dataObj["msg"]) {
                    setReplayMsg(null)
                }
            }
        }
    }, [dispatchData.data]);

    const scrollToBottom = () => {
        const dataLength = comments.length - 1;
        // console.log('scrollToBottom ====> len=%d, current=%d, max=%d',comments.length, currentVisibleIndex,maxVisibleIndex)
        if (comments.length > 0) {
            // startItem(dataLength)
            scrollToItem({index: dataLength, align: "end"})
            //
            setCurrentVisibleStopIndex(dataLength)
            setMaxVisible(dataLength);
            setVisibleStartIndex(comments[dataLength]);
            setCurrentTimeout(false);

            displayBottomMsg(comments[dataLength])
        }
    }


    const displayBottomMsg = (data: PinnedSticky) => {
        console.log("===>>>>  displayBottomMsg", data, stickyMsg)
        if (!!data.groupId) {
            const dataCopy: PinnedSticky = JSON.parse(JSON.stringify(data))
            dataCopy.theme = tribeInfo.theme;
            dataCopy.roles = tribeInfo.roles;
            dataCopy.seq = -1;
            dataCopy.groupId = "";
            dataCopy.index = new BigNumber(data.seq).toNumber();
            dispatchTheme(dataCopy)
        } else {
            dispatchTheme(data)
        }
    }

    const setMaxVisible = (n: number) => {
        // console.log("set max visible=[%d]", n)
        setMaxVisibleIndex(n)
        selfStorage.setItem(`maxVisibleIndex_${config.tribeId}`, n)
        const data: PinnedSticky = comments[n];
        if (data) {
            // selfStorage.setItem(`latest_view_${config.tribeId}`, data.records && data.records.length > 0 && data.records[0].timestamp)
        }
    }


    const onShare = async (msg: Message) => {
        // console.log("====> share msg: ", msg, new Date(msg.timestamp * 1000))
        const condition: Array<any> = [
            "tribeIdAndTimestamp",
            [config.tribeId, 2, msg.timestamp],
            [config.tribeId, 2, Math.floor(Date.now() / 1000) + 3600],
            false
        ]
        const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, 1, 20, condition)
        let shareMsgs: Array<Message> = [];
        let shareRoles: Array<TribeRole> = [];
        const data = rest.data;
        data.reverse();
        for (let stmsg of data) {
            shareMsgs.push(stmsg.records[0])
            if (shareRoles.length == 0) {
                shareRoles.push(...stmsg.roles)
            }
        }

        setShowShareModal(true);
        setShareMsgs(shareMsgs);
        setShareRoles(shareRoles)
    }

    const renInboxMsg = (messages: Array<Message>, msgIndex: number, seq: number): Array<any> => {
        const htmls = [];
        if (messages && messages.length > 0) {
            messages.forEach((m, index) => {
                const v = JSON.parse(JSON.stringify(m));
                let item;

                // console.log("ren msg ==========>  ",v , v["hideTime"])
                if (msgIndex > 0 && !v["hideTime"]) {
                    const pre: PinnedSticky = comments[msgIndex - 1];
                    if (pre && pre.records && pre.records.length > 0) {
                        const preMsg = pre.records[0];
                        if (preMsg.msgType != MessageType.Divide && preMsg.msgType != MessageType.Role) {
                            v["hideTime"] = !!preMsg && preMsg.role == v.role && preMsg.groupId == v.groupId && (Math.floor(preMsg.timestamp / 300) == Math.floor(v.timestamp / 300)) ? 1 : 2;
                        }
                        if (v && !!v.groupId) {
                            // v["hideTime"] = 2;
                        } else if (preMsg && !v.groupId && (
                            preMsg.owner == tribeInfo.keeper && v.owner !== tribeInfo.keeper ||
                            preMsg.owner != tribeInfo.keeper && v.owner == tribeInfo.keeper
                        )) {
                            v["hideTime"] = 2;
                        }
                    }
                }
                if (v.msgType == MessageType.Text || v.msgType == MessageType.Role || v.msgType == MessageType.Airdrop) {
                    let className = 'msg-no-role-rec';
                    if (v.role) {
                        className = owner == v.owner && !v.groupId ? "msg-sender" : "msg-receive"
                    }
                    if (v.msgType == MessageType.Role) {
                        className = `${className} role-sp`
                    }
                    const checked = checkedMsgArr.indexOf(v.id) > -1;
                    //@ts-ignore
                    item = <div className={className} key={index} onClick={(e) => {
                        if (showPin) {
                            e.stopPropagation();
                            const checkedCopy = [...checkedMsgArr]
                            if (checked) {
                                checkedCopy.splice(checkedMsgArr.findIndex(cv => cv == v.id), 1)
                            } else {
                                checkedCopy.push(v.id)
                            }
                            setCheckedMsgArr(checkedCopy);
                            selfStorage.setItem(`tribe_pin_arr`, checkedCopy)
                        }
                    }}>
                        <div className="inner" style={{maxWidth: '100%'}} onMouseOver={() => setCheckedMsgId(v.id)}>
                            {/*<div>{msgIndex}</div>*/}
                            <Text hideTime={!!v["hideTime"] && v["hideTime"] == 1}
                                  keeper={tribeInfo && tribeInfo.keeper} onSupport={onSupport}
                                  checked={checked || v.msgType == MessageType.Airdrop} msg={v}
                                  owner={owner}
                                  showPin={v.msgStatus == MessageStatus.dashed && showPin}
                            />

                        </div>

                        <Tools onShare={(msg) => onShare(msg)} msg={v}
                               showPin={v.msgStatus == MessageStatus.dashed && showPin} owner={owner}
                               onSupport={userLimit && userLimit.supportLeft > 0 && onSupport}
                               onReplay={(msg: Message) => {
                                   onReplay(msg)
                               }} onEdit={(msg: Message) => {
                            setShowModifyMsg(msg)
                        }} onDelete={(msg: Message) => {
                            tribeService.deleteMsg(msg.id).catch(e => {
                                console.log(e, "tribe del msg")
                            })
                        }} isChecked={checkedMsgId == v.id} keeper={tribeInfo && tribeInfo.keeper}/>
                    </div>
                } else if (v.msgType == MessageType.Dice) {
                    item = <Dice/>
                } else if (v.msgType == MessageType.Expression) {
                    item = <Expression/>
                } else if (v.msgType == MessageType.Divide) {
                    item = <div className="strike" key={index}>
                        {v.groupId ? <span>#{seq}</span> : <span>New Tape</span>}
                    </div>
                } else {
                    // console.log(index, v," divide........." )
                }
                htmls.push(item)
            })
        }

        return htmls;
    }
    // const Loading = () => <div style={{width: '100%', textAlign: 'center', padding: 12}}>⏳ Loading...</div>;


    // console.log("total - 1 > currentVisibleIndex : ",total - 1 > currentVisibleIndex, total -1, currentVisibleIndex, maxVisibleIndex )
    // console.log(" total - 1 - maxVisibleIndex > 0 && maxVisibleIndex > 0: ",  total - 1 - maxVisibleIndex > 0 && maxVisibleIndex > 0);

    const _url = stickyMsg && (stickyMsg as PinnedSticky).groupId ? stickyMsg.theme.image :
        pinnedStickies && pinnedStickies.data.length > 0 ? pinnedStickies.data[0].theme.image : tribeInfo && tribeInfo.theme.image


// You can use index to randomize
// and make the placeholder list more organic.
// the height passed is the one measured for the real item.
// the placeholder should be the same size.
    const ScrollSeekPlaceholder = ({height, index}) => {
        const pinnedSticky: PinnedSticky = comments[index];

        return <div
            style={{
                height,
                padding: "8px",
                boxSizing: "border-box",
                overflow: "hidden",
                borderRadius: 12,
                margin: 6,
            }}
        >
            <IonItem>
                <IonThumbnail slot="start">
                    <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                    <h3>
                        <IonSkeletonText animated={true} style={{'width': '80%'}}></IonSkeletonText>
                    </h3>
                    <p>
                        <IonSkeletonText animated={true} style={{'width': '60%'}}></IonSkeletonText>
                    </p>
                    <p>
                        <IonSkeletonText animated={true} style={{'width': '30%'}}></IonSkeletonText>
                    </p>
                </IonLabel>
            </IonItem>
        </div>
    }

    // use the visible range to provide information
    // about the list current position.
    const [visibleRange, setVisibleRange] = useState([0, 0]);
    const isAPP = (utils.isIos() || utils.isAndroid());

    return <>
        <div className={!pinnedStickies ? "msg-content" : "msg-content2"} style={{
            backgroundImage: `url(${utils.getDisPlayUrl(_url)})`,
        }}>
            <div className={`outer-box `}>
                <div className="inner-box">
                    <Virtuoso
                        ref={virtuoso}
                        style={{height: '100%'}}
                        totalCount={comments.length}
                        overscan={200}
                        isScrolling={(f) => {
                            // setFullScreen(!!f)
                        }}
                        // firstItemIndex={firstItemIndex}
                        // initialTopMostItemIndex={400}
                        endReached={(stopIndex) => {
                            console.log("stopIndex==>> ", stopIndex)
                            // scrollToBottom();
                            const data:PinnedSticky = comments[stopIndex];
                            loadNextPin(data.records[0].groupId)
                        }}
                        // firstItemIndex={firstItemIndex}
                        startReached={(startIndex)=>{
                            console.log("startIndex===> ", startIndex, comments)
                            const data:PinnedSticky = comments[startIndex];
                            loadPrevPin(data.records[0].groupId)
                        }}
                        itemsRendered={(items) => {
                            console.log("items>>> ", items);
                            if (items && items.length > 0) {
                                doScrollEvent({
                                    visibleStartIndex: items[0].index,
                                    visibleStopIndex: items[items.length - 1].index
                                })
                            }
                        }}
                        // context={{  }}
                        //                        @ts-ignore
                        //                         components={{ ScrollSeekPlaceholder }}
                        scrollSeekConfiguration={{
                            enter: (velocity) => {
                                if (visibleRange[1] > comments.length - 5) {
                                    setFullScreen(false)
                                } else if (visibleRange[1] < comments.length - 6) {
                                    if (velocity > 1) {
                                        setFullScreen(true)
                                    } else if (velocity < 0) {
                                        setFullScreen(false)
                                    }
                                }
                                return false//isAPP && velocity < 0?Math.abs(velocity) > 100:false
                            },
                            exit: (velocity) => {
                                const shouldExit = isAPP ? Math.abs(velocity) < 10 : true;
                                if (shouldExit) {
                                    // setVisibleRange(["-", "-"]);
                                }
                                return shouldExit;
                            },
                            change: (_velocity, {startIndex, endIndex}) => {
                                // setVisibleRange([startIndex,endIndex])
                            }
                        }}

                        itemContent={index => {
                            const pinnedSticky: PinnedSticky = comments[index];

                            if (pinnedSticky) {
                                if (pinnedSticky.records && pinnedSticky.records.length > 0
                                    && ((pinnedSticky.records[0].msgStatus !== MessageStatus.removed && pinnedSticky.records[0].msgStatus !== MessageStatus.draft)
                                        || (!!pinnedStickies && pinnedSticky.records[0].msgStatus == MessageStatus.draft))) {
                                    const isNewTheme = index > 0 && comments[index - 1] && (comments[index - 1] as PinnedSticky).records && (comments[index - 1] as PinnedSticky).records[0].msgStatus == MessageStatus.pinned
                                        && pinnedSticky.records && pinnedSticky.records[0].msgStatus == MessageStatus.dashed

                                    // const theme = stickyMsg.theme;
                                    const messages = pinnedSticky.records

                                    const msgItems = renInboxMsg(messages, index, pinnedSticky.seq)

                                    const isDifTap = index > 0 && comments[index + 1] && (comments[index + 1] as PinnedSticky).records && pinnedSticky.records
                                        && (comments[index + 1] as PinnedSticky).records[0].groupId != pinnedSticky.records[0].groupId ||
                                        (index > 0 && !comments[index + 1] && !!pinnedSticky.records[0].groupId)

                                    return <div className="visual-msg-box"
                                                style={{padding: index == comments.length - 1 ? "0 0 44px" : "0"}}
                                                key={`_s_${index}`}>
                                        {/*{showLoading && <Loading/>}*/}
                                        {
                                            isNewTheme &&
                                            <div className="strike">
                                                <span>New Tape</span>
                                            </div>
                                        }
                                        {
                                            index == 0 && <div style={{height: '20px'}}></div>
                                        }

                                        <div className={"visual-msg-content"} onClick={(e) => {
                                            // console.log("click msg")
                                            e.stopPropagation();
                                            e.persist();
                                            const sticky = comments[index];
                                            if (sticky && stickyMsg && sticky.seq != stickyMsg.seq) {
                                                // setStickyMsg(sticky)
                                                dispatchTheme(sticky);
                                            }
                                            // setCheckedMsgId(sticky && (sticky as PinnedSticky).records && (sticky as PinnedSticky).records.length>0 && (sticky as PinnedSticky).records[0].id)
                                        }}>
                                            {msgItems}
                                        </div>
                                        {
                                            isDifTap && onFork && <div style={{
                                                padding: '6px 12px',
                                                display: "flex",
                                                justifyContent: "flex-end"
                                            }}>
                                                <div className="fork-icon">
                                                    <IonButtons>
                                                        <IonButton onClick={() => {
                                                            // setShowLoading(true)
                                                            onFork(pinnedSticky.records[0].groupId, {
                                                                tribeId: config.tribeId,
                                                                keeper: "",
                                                                lastPinedSeq: 0,
                                                                onlineUser: 0,
                                                                theme: pinnedSticky.theme,
                                                                title: tribeInfo.title,
                                                                desc: "",
                                                                themeTag: pinnedSticky.theme.themeTag,
                                                                themeDesc: pinnedSticky.theme.themeDesc,
                                                            }).catch(e => {
                                                                // setShowLoading(false)
                                                                console.error(e)
                                                            })
                                                        }}><IonIcon src={gitBranchOutline} style={{
                                                            color: "#4C89F8",
                                                            fontSize: "24px"
                                                        }}/></IonButton>
                                                    </IonButtons>
                                                </div>
                                            </div>
                                        }
                                        {
                                            (index == comments.length - 1 && !!pinnedSticky.groupId) &&
                                            <div className="strike">
                                                <span>New Tape</span>
                                            </div>
                                        }
                                    </div>
                                }
                            }
                        }}
                    />

                </div>
            </div>
            {/*{*/}
            {/*    //@ts-ignore*/}
            {/*<div ref={outerRef} className={`outer-box `}>*/}
            {/*    {*/}
            {/*        //@ts-ignore*/}
            {/*        <div ref={innerRef} className="inner-box">*/}
            {/*            {*/}
            {/*                items && items.map(({index, measureRef, size}) => {*/}
            {/*                    const showLoading = index === 0 && total < total;*/}

            {/*                })*/}
            {/*            }*/}
            {/*        </div>*/}
            {/*    }*/}
            {/*</div>*/}
            {/*}*/}
            {/*{*/}
            {/*    stickyMsg&& stickyMsg.groupId && owner && <div className="pinned-fix pinned-img-animation2">*/}
            {/*        <div className="pinned-fix timg">*/}
            {/*            <img src={(stickyMsg as PinnedSticky).theme.image} width='100%' height='100%'/>*/}
            {/*        </div>*/}
            {/*        <div className="pinned-fix tdesc">*/}
            {/*            <div className="ttitle">Pinned #{(stickyMsg as PinnedSticky).seq}</div>*/}
            {/*            <div style={{fontSize: '13px',color:'#868990'}}>*/}
            {/*                {(stickyMsg as PinnedSticky).records.length} messages,*/}
            {/*                {(stickyMsg as PinnedSticky).roles.length} roles*/}
            {/*            </div>*/}
            {/*            <div className="cot">*/}
            {/*               <div className="cot-in"></div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*}*/}
            <IonLoading
                cssClass='my-custom-class'
                isOpen={showLoading}
                onDidDismiss={() => setShowLoading(false)}
                message={'Please wait...'}
                duration={60000}
            />

            {
                comments.length - 1 > currentVisibleStopIndex &&
                <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{
                    bottom: !pinnedStickies ? '145px' : "100px",
                    right: !pinnedStickies ? "" : "35px",
                    cursor: 'pointer'
                }}>
                    <div className="fab-cus">
                        {
                            (comments.length - 1 > currentVisibleStopIndex && currentVisibleStopIndex > 10) &&
                            <div style={{paddingTop: '6px'}} onClick={() => {
                                startItem(0);
                            }}>
                                <IonIcon icon={chevronUpOutline} size="small"/>
                            </div>
                        }
                        {
                            comments.length - 1 - maxVisibleIndex > 0 && maxVisibleIndex > 0 &&
                            <div className="fab-cus-dig">
                                <small>{comments.length - 1 - maxVisibleIndex < 0 ? 0 : comments.length - 1 - maxVisibleIndex}</small>
                            </div>
                        }
                        <div style={{paddingTop: '6px'}} onClick={() => {
                            scrollToBottom();
                        }}>
                            <IonIcon icon={chevronDownOutline} size="small"/>
                        </div>
                    </div>
                </IonFab>
            }

            <ShareEx stickyMsg={stickyMsg} isOpen={showShareModal} showHistory={true}
                     onClose={() => setShowShareModal(false)}
                     tribeInfo={tribeInfo} latestMsg={shareMsgs} roles={shareRoles as Array<TribeRole>} owner={owner}/>

            <IonModal isOpen={!!showModifyMsg} className="role-select-list" onDidDismiss={() => setShowModifyMsg(null)}>
                <IonHeader collapse="fade">
                    <IonToolbar>
                        <IonTitle>Update messages</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setShowModifyMsg(null)}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    {
                        showModifyMsg && showModifyMsg.content && <div style={{
                            // display: 'flex',
                            // flexDirection: 'row',
                            // justifyContent: 'center'
                        }}>
                            {
                                showModifyMsg.content && <div style={{maxWidth: '100%'}}>
                                    <div className="create-title">Role</div>
                                    <div style={{maxWidth: "100%"}}>
                                        <IonRow>
                                            {
                                                selectRole && selectRole.id != (showModifyMsg as Message).role && <>

                                                    <IonCol size="5">
                                                        {
                                                            (showModifyMsg as Message).actor ?
                                                                <div style={{position: "relative"}}>
                                                                    <IonItem lines="none" color="light"
                                                                             style={{borderRadius: 12}}>
                                                                        <IonAvatar className="ion-avatar2">
                                                                            <img
                                                                                src={utils.getDisPlayUrl((showModifyMsg as Message).actor.avatar)}/>
                                                                        </IonAvatar>
                                                                        <IonLabel className="ion-text-wrap">
                                                                            <b style={{fontSize: '12px'}}>&nbsp;{(showModifyMsg as Message).actor.name}</b>
                                                                        </IonLabel>
                                                                    </IonItem>
                                                                </div> : <div style={{position: "relative"}}>
                                                                    <IonItem lines="none" color="light"
                                                                             style={{borderRadius: 12}}>
                                                                        <IonAvatar className="ion-avatar2">
                                                                            <img src={"./assets/img/default-avatar.png"}/>
                                                                        </IonAvatar>
                                                                        <IonLabel className="ion-text-wrap">
                                                                            <b style={{fontSize: '12px'}}>&nbsp;Narrator</b>
                                                                        </IonLabel>
                                                                    </IonItem>
                                                                </div>
                                                        }
                                                    </IonCol>
                                                    <IonCol size="2">
                                                        <div className="Swlwn"><IonIcon src={arrowForwardOutline}
                                                                                        size="large"/></div>
                                                    </IonCol>
                                                </>
                                            }
                                            <IonCol
                                                size={selectRole && selectRole.id != (showModifyMsg as Message).role ? "5" : "12"}>
                                                {
                                                    selectRole && <div style={{position: "relative"}}>
                                                        <IonItem lines="none" color="light" style={{borderRadius: 12}}>
                                                            <IonAvatar className="ion-avatar2">
                                                                <img src={utils.getDisPlayUrl(selectRole.avatar)}/>
                                                            </IonAvatar>
                                                            <IonLabel className="ion-text-wrap">
                                                                &nbsp;<b
                                                                style={{fontSize: '12px'}}>{selectRole.name}</b>
                                                            </IonLabel>
                                                        </IonItem>
                                                    </div>
                                                }
                                            </IonCol>
                                        </IonRow>
                                    </div>

                                    <div className="create-title">Message <IonIcon src={createOutline} color="medium"
                                                                                   style={{transform: "translateY(2px)"}}/>
                                    </div>
                                    <IonTextarea className="msg-input" rows={1} placeholder="Input your message"
                                                 autoGrow value={showModifyMsg.content.content}
                                                 onIonChange={(e) => {

                                                     const msgCopy = JSON.parse(JSON.stringify(showModifyMsg))
                                                     msgCopy.content.content = e.target.value;
                                                     setShowModifyMsg(msgCopy)
                                                 }}/>
                                    <div style={{maxWidth: '100%'}}>
                                        {
                                            replayMsg && <ReplayText msg={replayMsg}/>
                                        }
                                    </div>
                                    <div className="create-title">Image <IonIcon src={createOutline} color="medium"
                                                                                 style={{transform: "translateY(2px)"}}/>
                                    </div>
                                    <div style={{
                                        borderRadius: '5px',
                                        // border: '1px solid var(--ion-color-medium)',
                                        padding: '0 12px',
                                        position: "relative",
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}>
                                        <UploadImage borderRadio={12} defaultIcon={add}
                                                     width={showModifyMsg && showModifyMsg.content && !showModifyMsg.content.image["url"] ? "100%" : ""}
                                                     imgUrl={showModifyMsg && showModifyMsg.content && showModifyMsg.content.image["url"] && utils.getDisPlayUrl(showModifyMsg.content.image)}
                                                     setImgUrl={(url, w, h) => {
                                                         const msgCopy = JSON.parse(JSON.stringify(showModifyMsg))
                                                         msgCopy.content.image = {url: url, width: w, height: h}
                                                         setShowModifyMsg(msgCopy)
                                                     }}/>
                                        {/*<div style={{position: "absolute",top: 16 , right: 26}} onClick={(e)=>{*/}
                                        {/*e.persist()}*/}
                                        {/*}>*/}
                                        {/*    <IonIcon src={createOutline} size="large" color="medium"/>*/}
                                        {/*</div>*/}
                                    </div>

                                    <IonButton expand="block" onClick={() => {
                                        tribeService.updateMsg(showModifyMsg.id, '0x' + Buffer.from(JSON.stringify(showModifyMsg.content)).toString('hex'),
                                            selectRole && selectRole.id, replayMsg && replayMsg.id
                                        ).then(() => {
                                            setShowModifyMsg(null)
                                        }).catch(e => {
                                            console.log(e)
                                        })
                                    }}>Commit</IonButton>
                                </div>
                            }

                        </div>
                    }

                </IonContent>
            </IonModal>
        </div>
    </>

}