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
    UserLimit, WsStatus
} from "../../../../types";

import './message.scss';
import {useAppDispatch, useAppSelector} from "../../../../common/state/app/hooks";
import {saveDataState} from "../../../../common/state/slice/dataSlice";
import {saveMessageState} from "../../../../common/state/slice/messageSlice";
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
    IonToolbar, Gesture, createGesture
} from '@ionic/react';
import {
    arrowForwardOutline,
    createOutline,
} from "ionicons/icons";
import {tribeService} from "../../../../service/tribe";
import UploadImage from "../../../utils/UploadImage";
import add from "../../../../img/add.png";
import config from "../../../../common/config";
import tribeWorker from "../../../../worker/imWorker";
import BigNumber from "bignumber.js";
import selfStorage from "../../../../common/storage";
import {utils} from "../../../../common";
import {ShareEx} from "../../../utils/ShareEx";
import {ReplayText} from "./Types/ReplayText";
import {Virtuoso} from 'react-virtuoso'
import {MessageItem} from "./MessageItem";

interface Props {
    pinnedStickies?: { data: Array<PinnedSticky>, total: number }
    tribeInfo: TribeInfo;
    owner: string; // address
    onSupport?: (msgId: string, f: boolean) => void;
    showPin?: boolean
    showPinnedMsgDetail?: (groupId: string) => void;
    onReload?: (loadOwnerOnly: boolean) => void;
    loaded?: boolean
    userLimit?: UserLimit
    selectRole?: TribeRole
    shareMsgId?: string
    onFork?: (groupId: string, forkTribeInfo: TribeInfo) => void;

    subscribed?: boolean;
    onSubscribe?: (f: boolean) => void;

}

const pageSize = 50;
let count = 0;
let loadCount = 0;

const currentMsgIndexKey = () => `current_msg_v2_index_${config.tribeId}`;

function setCurrentVisible(visibleStartId: number) {
    selfStorage.setItem(currentMsgIndexKey(), visibleStartId)
}

const getCurrentVisible = (): number => {
    const id = selfStorage.getItem(currentMsgIndexKey());
    return !id ? -1 : id;
}

function combile(comp: Array<PinnedSticky>, keeper: string): Array<PinnedSticky> {
    if (!comp || comp.length == 0) {
        return [];
    }
    const ret: Array<PinnedSticky> = [];
    let msgIndex = comp[0].records[0].msgIndex;
    let groupByTime: { role: string, timestamp: number, groupId: string, owner: string } = null;
    let lastPin: PinnedSticky = null;
    for (let i = 0; i < comp.length; i++) {
        let pMsg = JSON.parse(JSON.stringify(comp[i]));
        const nextMsg = i < comp.length ? comp[i + 1] : null
        if ((pMsg as PinnedSticky).records && (pMsg as PinnedSticky).records[0]) {
            const msg: Message = (pMsg as PinnedSticky).records[0];
            if (msg.msgType !== MessageType.Role) {
                msg.hideTime = !!groupByTime && groupByTime.role == msg.role && groupByTime.groupId == msg.groupId && (Math.floor(groupByTime.timestamp / 300) == Math.floor(msg.timestamp / 300));

                if (groupByTime && keeper && (
                    groupByTime.owner == keeper && msg.owner !== keeper ||
                    groupByTime.owner !== keeper && msg.owner == keeper
                )) {
                    if (!msg.groupId) {
                        msg.hideTime = false;
                    }
                }
                groupByTime = {role: msg.role, timestamp: msg.timestamp, groupId: msg.groupId, owner: msg.owner};
            } else {
                msg.hideTime = false;
                groupByTime = null;
            }

            msg.msgIndex = msgIndex++;
        }

        pMsg.showPin = {
            // lastPin: JSON.parse(JSON.stringify(comp[i])),
            showPin: lastPin && lastPin.groupId !== pMsg.groupId,
            showFork: !nextMsg && !!pMsg.groupId || nextMsg && nextMsg.groupId !== pMsg.groupId
        };
        ret.push(pMsg)

        lastPin = pMsg;
    }

    return ret;
}

let lastVisible:{startIndex:number,endIndex} = {startIndex: 0, endIndex: 0}; //0; //init -1 up, 1 down;

export const MessageContentVisualsoChild: React.FC<Props> = ({
                                                                  onFork,
                                                                 shareMsgId, userLimit,
                                                                 selectRole, pinnedStickies,
                                                                 loaded, onReload, showPinnedMsgDetail,
                                                                 showPin, owner,
                                                                 tribeInfo, onSupport, subscribed, onSubscribe,
                                                             }) => {

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
    const [loadedData, setLoadedData] = useState(false)

    const [firstItemIndex, setFirstItemIndex] = useState(0)
    const [total, setTotal] = useState(0)
    const [overscan, setOverscan] = useState(200)

    // useLayoutEffect(() => {
    //     const doc = document.querySelectorAll('[data-virtuoso-scroller=true]');
    //     if (doc && doc.length > 0) {
    //         doc[0].className = "customer-scroll";
    //     }
    // }, [])

    // useEffect(() => {
    //     fetchMsgByIndex(firstIndex).catch(e => console.error(e))
    // }, [firstIndex])

    useEffect(() => {
        if (!!shareMsgId) {
            tribeService.msgInfo(shareMsgId).then(msgInfo => {
                fetchMsgByIndex(msgInfo.msgIndex).catch(e => console.error(e))
            })
        }
    }, [shareMsgId])

    // const setStatusBarHide = async (f: boolean) => {
    //     if (!await isApp()) {
    //         return;
    //     }
    //     if (f) {
    //         StatusBar.hide().catch(e => console.error(e))
    //     } else {
    //         StatusBar.show().catch(e => console.error(e))
    //     }
    // }
    //
    // const setFullScreen = (scrollForward: boolean) => {
    //     try {
    //         if (!!setHideMenu && (utils.isAndroid() || utils.isIos())) {
    //             if (scrollForward) {
    //                 setHideMenu(true)
    //                 setStatusBarHide(true)
    //             } else {
    //                 setHideMenu(false)
    //                 setStatusBarHide(false)
    //             }
    //         }
    //     } catch (e) {
    //         console.error(e)
    //     }
    // }

    // const setCurrentTimeout = useCallback((f: boolean) => {
    //     // console.log("visibleStartId == ", visibleStartId)
    //     if (visibleStartId && delaySaveCurrentVisibleIndex++ == 0) {
    //         setTimeout(() => {
    //             setCurrentVisible(visibleStartId);
    //             const itemStart = comments[visibleStartId - firstItemIndex]
    //             if(!!itemStart){
    //                 setStickyMsg(itemStart)
    //             }
    //             delaySaveCurrentVisibleIndex = 0;
    //         }, 1000)
    //     }
    // },[comments,firstItemIndex, setCurrentVisible, setStickyMsg])

    const fetchMsgByIndex = async (firstIndex: number, toBottom: boolean = false) => {
        setOverscan(0);
        if (firstIndex > -1) {
            let reqIndex = firstIndex;
            let reqPageSize = pageSize;
            if (reqIndex > pageSize) {
                reqPageSize = pageSize * 2
                reqIndex = reqIndex - pageSize;
            } else {
                reqPageSize = pageSize + reqIndex;
                reqIndex = 0;
            }
            const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, reqIndex, reqPageSize);
            const {total} = await tribeService.streamMsg(config.tribeId, 0, 1);
            const comp = rest.data;
            // console.log("======== comments: ", comments);
            // combile(comp);
            setComments(combile(comp, tribeInfo && tribeInfo.keeper))
            setTotal(pre => {
                return total
            });
            setFirstItemIndex(reqIndex)
            console.log("------> firstItemIndex: [%d], scroll to=[%d]", reqIndex, firstIndex, comp.length > 0 && comp[0])

            setImmediate(() => {
                if (toBottom) {
                    scrollToItem({index: rest.total - 1, align: "end"});
                    // setTimeout(()=>{
                    // }, 100)
                } else {
                    // scrollToItem({index: firstIndex + reqIndex, align: "start"});
                    startItem(firstIndex - reqIndex)
                }

            })
        }
    }

    const initLatestPin = async () => {

        const streamMsg1 = await tribeWorker.getPinnedMessageArray(config.tribeId, 0, 2);
        if (streamMsg1 && streamMsg1.total == 0) {
            const defaultThem = await tribeService.defaultTheme();
            setStickyMsg(defaultThem)
        } else {
            let latestId = getCurrentVisible();
            if (latestId == -1) {
                latestId = pageSize < streamMsg1.total ? streamMsg1.total - 1 : 0;
            }
            if (latestId >= streamMsg1.total) {
                latestId = streamMsg1.total - 1;
            }
            await fetchMsgByIndex(latestId, false)
            // console.log("=========initLatestPin >> start=[%d], end=[%d] ", latestId, pageSize);
            // const data = await tribeWorker.getPinnedMessageArray(config.tribeId, latestId, pageSize);
            // const comp = data.data;
            // combile(comp)
            // console.log("=========initLatestPin >> start=[%d], end=[%d], data=[%d] ", latestId, pageSize, data.data.length);
            // setComments(comp)
            // setTotal(pre => {
            //     console.log("------> tribeWorker set total 5 ==  ", pre, data.total)
            //     return data.total
            // });
            // console.log("------> firstItemIndex: [%d], initLatestPin", latestId)
            // setFirstItemIndex(latestId);
        }
    }

    // const activePage = async () => {
    //     console.log("=========activePage >> data=[%d] ", comments.length);
    //     if (comments.length > 0) {
    //         const lastMsg: PinnedSticky = comments[comments.length - 1];
    //         if (lastMsg) {
    //             loadMore(lastMsg.records[0].msgIndex)
    //         }
    //     }
    // }

    const prependItems = useCallback(() => {
        // setLoadingData(true)
        if (firstItemIndex > 0) {
            let reqPageSize = pageSize;
            let reqIndex = firstItemIndex;
            if (reqIndex > reqPageSize) {
            } else {
                reqPageSize = firstItemIndex
            }
            console.log("=========prependItems >> start=[%d], end=[%d] ", reqIndex, -reqPageSize);
            tribeWorker.getPinnedMessageArray(config.tribeId, reqIndex, -reqPageSize).then(rest => {
                console.log("=========prependItems >> start=[%d], end=[%d] , data=[%d]", reqIndex, -reqPageSize, rest.data.length);
                const nextFirstItemIndex = firstItemIndex - pageSize;
                console.log("------> firstItemIndex: [%d], prependItems", nextFirstItemIndex >= 0 ? nextFirstItemIndex : 0)
                setFirstItemIndex(nextFirstItemIndex >= 0 ? nextFirstItemIndex : 0)
                setComments(pre => {
                    const comp = [...rest.data, ...pre];
                    return combile(comp, tribeInfo && tribeInfo.keeper)
                })
            }).catch(() => {
                // setLoadingData(false)
            })
        }

        return false
    }, [firstItemIndex, comments, setComments, total])

    const loadMore = useCallback((lastIndex: number) => {
        if (comments.length > 0 && comments.length < total && lastIndex > -1) {
            const lastMsg: PinnedSticky = comments[comments.length - 1];
            console.log("=========loadMore >> start=[%d], total=[%d] ", lastMsg.records[0].msgIndex + 1, total);
            if (
                (!!lastMsg && !!lastMsg.records && lastMsg.records[0].msgIndex > -1 && lastMsg.records[0].msgIndex < total - 1)
            ) {
                tribeWorker.getPinnedMessageArray(config.tribeId, lastMsg.records[0].msgIndex + 1, pageSize).then(rest => {
                    setCommentsInner({total: rest.total, messages: rest.data}, true)
                }).catch(e => console.error(e))
            }
        }
        return false;
    }, [comments, total, setComments, setTotal])


    useEffect(() => {
        console.log("init component ...")
        if (!pinnedStickies) {
            {
                const max = selfStorage.getItem(`maxVisibleIndex_${config.tribeId}`);
                setMaxVisibleIndex(max ? max : 0)
            }
        } else {
            const comp = pinnedStickies.data;
            // combile(comp);
            // console.log(comp)
            setComments(combile(comp, tribeInfo && tribeInfo.keeper))
            setTotal(pinnedStickies.data.length)
        }
    }, [loaded])

    // useEffect(() => {
    //     console.log("......... dispatch theme")
    //     dispatch(saveDataState({
    //         data: {stickyMsg: stickyMsg},
    //         tag: 'updateTheme2'
    //     }))
    // }, [stickyMsg])

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

    const onReplay = (msg: Message) => {
        if (owner) {
            setReplayMsg(msg)
            dispatch(saveDataState({data: JSON.stringify({msg: msg}), tag: 'replayMsg'}))
        }
    }

    useEffect(() => {
        if (loaded && loadCount++ == 0) {
            initLatestPin().then(() => {
                setLoadedData(true);
            }).catch(e => console.error(e))
        }
    }, [loaded])

    const setCommentsInner = useCallback((data: { total: number, messages: Array<PinnedSticky> }, append?: boolean) => {

        const messages = data.messages;
        new Promise(resolve => {
            setComments((preComments) => {
                const nextComments = [];
                let commentsCopy: Array<PinnedSticky> = [...preComments];

                // let total = 0 ;
                for (let index = 0; index < messages.length; index++) {
                    const _comment = messages[index];

                    // remove all unpinned msg when pin type
                    if (_comment && _comment.records && _comment.records.length > 0 && _comment.records[0].msgType == MessageType.Pin) {
                        tribeService.init();
                        onReload(false);
                        //TODO
                    } else if (_comment.records && _comment.records.length > 0 && _comment.records[0].msgType == MessageType.UpdateTribe) {
                        // onReload(false);
                    } else {
                        const _index = commentsCopy.findIndex(v => (v.records && v.records.length > 0 && _comment && _comment.records && _comment.records.length > 0 && v.records[0].id == _comment.records[0].id))
                        //new message
                        if (_index == -1) {
                            if (_comment.records && _comment.records[0].msgStatus !== MessageStatus.removed) {
                                if (commentsCopy.length > 0) {

                                    const latest: PinnedSticky = commentsCopy[commentsCopy.length - 1];
                                    const latestSeq = new BigNumber(_comment.records && _comment.records.length > 0 && _comment.records[0].seq);
                                    if (new BigNumber(latest.records && latest.records.length > 0 && latest.records[0].seq).comparedTo(
                                        latestSeq
                                    ) == -1) {
                                        nextComments.push(_comment)
                                        // total++
                                    } else {
                                        const index = commentsCopy.findIndex(msg => msg.records && msg.records.length > 0 && new BigNumber(msg.records[0].seq).comparedTo(latestSeq) == 1)
                                        if (index > -1) {
                                            // change seq
                                            // console.log("=====> change seq", index, _comment.records[0].msgIndex, commentsCopy[index].records[0].msgIndex, commentsCopy.length, nextComments.length)
                                            // commentsCopy.splice(index, 1, ...[_comment, commentsCopy[index]])
                                        }
                                    }
                                } else {
                                    nextComments.push(_comment)
                                }
                            }
                        } else {
                            //removed
                            if (_comment.records && _comment.records.length > 0 && _comment.records[0].msgStatus == MessageStatus.removed) {
                                commentsCopy.splice(_index, 1)
                                // total--;
                            } else { //support or edit
                                commentsCopy.splice(_index, 1, _comment);
                                // total++
                            }
                        }
                    }

                    if (_comment.records && _comment.records.length > 0 && _comment.records[0].msgType == MessageType.Role) {
                        // onReload(false);
                    }

                    if (_comment.records && _comment.records.length > 0 && _comment.records[0].owner == owner) {
                        onReload(true);
                    }

                }
                // console.log("=========> commentsCopy>>>", commentsCopy, nextComments, append, visibleRange.endIndex , total);
                const _cIndex = commentsCopy.findIndex(v => v.records[0].groupId == "");
                if (commentsCopy.length == 0 || _cIndex >= 0 || append || visibleRange.endIndex == total - 1) {
                    const comp = [...commentsCopy, ...nextComments];
                    const ret = combile(comp, tribeInfo && tribeInfo.keeper)
                    resolve(true)
                    return ret
                }
                const ret = combile(commentsCopy, tribeInfo && tribeInfo.keeper)
                resolve(true)
                return ret
            })
        }).then(() => {
            setTotal(data.total)
        })

    }, [setComments, total, comments, setTotal])

    useEffect(() => {
        if (loaded && count++ == 0) {
            tribeWorker.addMessageListener(config.tribeId, async (data: { total: number, messages: Array<PinnedSticky> }) => {
                try {
                    console.log("======> startcallbutton ", data)
                    setCommentsInner(data)
                } catch (e) {
                    console.error(e)
                }
            });
        }
    }, [loaded, setComments, total, comments, setTotal])

    useEffect(() => {
        if (!pinnedStickies && dispatchData) {
            if (dispatchData.tag == 'scrollToItem' && dispatchData.data) {
                // virtuoso.current.scrollToIndex({ index: comments.length - 1, behavior: 'smooth' });
                if (comments && comments.length > 0 && (comments[comments.length - 1] as PinnedSticky).records[0].msgIndex == total - 1) {
                    setTimeout(() => scrollToItem({index: total - 1, align: "end"}), 100)
                } else {
                    fetchMsgByIndex(total - 1, true);
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
            } else if (dispatchData.tag == 'setFirstIndex' && dispatchData.data){
                let dataObj = dispatchData.data;
                if (dataObj["firstIndex"] > -1) {
                    const firstIndex = dataObj["firstIndex"];
                    fetchMsgByIndex(firstIndex,false).catch(e=>console.error(e));
                }
            }
        }
    }, [dispatchData.data]);

    const setMaxVisible = (n: number) => {
        console.log("set max visible=[%d]", n)
        setMaxVisibleIndex(n)
        selfStorage.setItem(`maxVisibleIndex_${config.tribeId}`, n)
        // const data: PinnedSticky = comments[n];
        // if (data) {
        //     // selfStorage.setItem(`latest_view_${config.tribeId}`, data.records && data.records.length > 0 && data.records[0].timestamp)
        // }
    }


    const onShare = useCallback((msg: Message) => {
        // console.log("====> share msg: ", msg, new Date(msg.timestamp * 1000))
        tribeWorker.getPinnedMessageArray(config.tribeId, msg.msgIndex, 20).then(rest => {
            let shareMsgs: Array<Message> = [];
            let shareRoles: Array<TribeRole> = [];
            const data = rest.data;
            // data.reverse();
            for (let stmsg of data) {
                shareMsgs.push(stmsg.records[0])
                if (shareRoles.length == 0) {
                    shareRoles.push(...stmsg.roles)
                }
            }

            setShowShareModal(true);
            setShareMsgs(shareMsgs);
            setShareRoles(shareRoles)
        })

    }, [setShowShareModal, setShareMsgs, setShareRoles])

    const _url = useMemo(() => {
        return stickyMsg && (stickyMsg as PinnedSticky).groupId ? stickyMsg.theme.image :
            pinnedStickies && pinnedStickies.data.length > 0 ? pinnedStickies.data[0].theme.image : tribeInfo && tribeInfo.theme.image
    }, [stickyMsg, pinnedStickies, tribeInfo])

    const [atBottom, setAtBottom] = useState(false)
    const showButtonTimeoutRef = useRef(null)
    const [showButton, setShowButton] = useState(false)

    useEffect(() => {
        return () => {
            clearTimeout(showButtonTimeoutRef.current)
        }
    }, [])

    useEffect(() => {
        clearTimeout(showButtonTimeoutRef.current)
        if (!atBottom) {
            //@ts-ignore
            showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500)
        } else {
            setShowButton(false)
        }
    }, [atBottom, setShowButton])

    const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    })

    const [isScrolling, setIsScrolling] = useState(false);

    // const [isScrollUp, setIsScrollUp] = useState(false);
    const [isScrollDown, setIsScrollDown] = useState(false);

    // useEffect(()=>{
    //     dispatch(saveMessageState({
    //         data: {isScrollUp: isScrollUp},
    //         tag: 'isScrollUp'
    //     }))
    // },[isScrollUp])

    useEffect(()=>{
        dispatch(saveMessageState({
            data: {isScrollDown: isScrollDown},
            tag: 'isScrollDown'
        }))
    },[isScrollDown])

    useEffect(()=>{
        document.addEventListener('ionBackButton', (ev) => {
            console.log("===> ionBackButton", ev)
            ev.detail.register(10, () => {
                console.log('Handler was called!');
            });
        });
    },[])

    // const Loading = () => <div style={{width: '100%', textAlign: 'center', padding: 12}}>⏳ Loading...</div>;

    // setting 'auto' for behavior does help in this sample, but not in my actual code
    const followOutput = useCallback((isAtBottom) => {
        console.log('MessagesLislowOutput isAtBottom', isAtBottom, atBottom);

        const check = comments.length > 0 && (comments[comments.length - 1] as PinnedSticky).records && (comments[comments.length - 1] as PinnedSticky).records[0].msgIndex >= total - 3;
        return isAtBottom && atBottom && check ? 'auto' : false;
    }, [comments, atBottom, total]);

    const bottomChange = useCallback((bottom) => {
        console.log("at bottom", bottom, isScrolling)
        if (bottom !== atBottom) {
            // setTimeout(()=>setAtBottom(bottom), 100)
        }
    }, [setAtBottom])

    const dispatchThemeFn = useCallback((data: PinnedSticky) => {
        setStickyMsg(data)
        dispatch(saveDataState({
            data: {stickyMsg: data, stickyMsgTop: data},
            tag: 'updateTheme2'
        }))
    }, [setStickyMsg])

    useEffect(() => {
        if (!!loaded && !!loadedData && !pinnedStickies) {
            setOverscan(200);
            // console.log("visibleRange.startIndex >= firstItemIndex: ", visibleRange.startIndex, firstItemIndex)
            if (visibleRange.startIndex >= firstItemIndex) {
                const _startIndex = visibleRange.startIndex - firstItemIndex;
                const _endIndex = visibleRange.endIndex - firstItemIndex;
                const itemStart: PinnedSticky = comments[_startIndex];
                const itemEnd: PinnedSticky = comments[_endIndex];
                if (itemEnd && itemEnd.records && itemEnd.records[0].msgIndex > maxVisibleIndex) {
                    setMaxVisible(itemEnd.records[0].msgIndex)
                } else if (maxVisibleIndex > total - 1) {
                    setMaxVisible(total - 1)
                }
                if (visibleRange.endIndex >= total - 1 && atBottom) {
                    if (!!tribeInfo) {
                        const groupArr = tribeService.getGroupMap();
                        const defaultGroup = groupArr[groupArr.length - 1];
                        dispatchThemeFn({
                            theme: tribeInfo && tribeInfo.theme,
                            seq: -1,
                            roles: defaultGroup ? defaultGroup.roles : [],
                            records: [],
                            groupId: "",
                            index: -1
                        });
                    }
                }
                setCurrentVisible(visibleRange.startIndex);
                if (!!itemStart) {
                    dispatchThemeFn(itemStart)
                }
            }

            // dispatch hide bar
            // if(visibleRange.startIndex > lastVisible.startIndex){
            //     setIsScrollDown(true);
            // }else if(visibleRange.startIndex  < lastVisible.startIndex){
            //     setIsScrollDown(false);
            // }
            // lastVisible = visibleRange
        }

    }, [visibleRange])



    useEffect(()=>{
        const gesture: Gesture = createGesture({
            el: document.querySelector('.rectangle-content'),
            threshold: 100,
            direction: "x",
            disableScroll: true,
            gestureName: 'my-gesture',
            onMove: ev => {
                if(ev.startX < ev.currentX){
                    window.location.href = "./"
                }
            }
        });
        gesture.enable();
    },[])

    return <>

        <div className={!pinnedStickies ? "msg-content rectangle-content" : "msg-content2 rectangle-content"} style={{
            backgroundImage: `url(${utils.getDisPlayUrl(_url)})`,
        }}>
            <div className={`outer-box `}>
                <div className="inner-box">
                    {/*{loadingData && <Loading/>}*/}
                    <div className="position-top">[{visibleRange.startIndex}] - [{visibleRange.endIndex}]
                        : [{firstItemIndex}]..[{total}]
                    </div>
                    <Virtuoso
                        ref={virtuoso}
                        style={{height: '100%'}}
                        overscan={0}
                        atTopThreshold={200}
                        // increaseViewportBy={{top: -20, bottom: 0}}
                        isScrolling={setIsScrolling}
                        firstItemIndex={firstItemIndex}
                        rangeChanged={setVisibleRange}
                        data={comments}
                        endReached={loadMore}
                        startReached={prependItems}
                        // scrollSeekConfiguration={{
                        //     enter: (velocity) => {
                        //         if(Math.abs(velocity) > 10){
                        //             setIsScrollDown(velocity > 0)
                        //         }
                        //         return false;
                        //     },
                        //     exit: (velocity) => {
                        //         const shouldExit = Math.abs(velocity) < 5;
                        //         // if (shouldExit) {
                        //         //     setVisibleRange({startIndex: 0, endIndex: 0});
                        //         // }
                        //         return shouldExit;
                        //     },
                        //     change: (_velocity, { startIndex, endIndex }) => {}
                        // }}
                        followOutput={atBottom && (total > 0 && visibleRange.startIndex > total - pageSize) && followOutput}
                        atBottomStateChange={(total > 0 && visibleRange.endIndex >= total - 2) && bottomChange}
                        // initialTopMostItemIndex={getCurrentVisible()}
                        // itemSize={(el, field) => {
                        //     return el.getBoundingClientRect().height;
                        // }}
                        itemContent={(index, data) => {
                            return <MessageItem index={index} pinnedSticky={data as PinnedSticky} total={total}
                                                atBottom={atBottom} firstItemIndex={firstItemIndex}
                                                checkedMsgArr={checkedMsgArr} showPin={showPin} owner={owner}
                                                checkedMsgId={checkedMsgId} pinnedStickies={pinnedStickies}
                                                onSupport={onSupport} onFork={onFork} tribeInfo={tribeInfo}
                                                onShare={onShare} stickyMsg={stickyMsg} userLimit={userLimit}
                                                onEdit={(msg) => setShowModifyMsg(msg)} onReplay={onReplay}
                                                dispatchTheme={(data) => {
                                                    setCheckedMsgId(data.records[0].id)
                                                    dispatchThemeFn(data);
                                                }}
                                                    setCheckedMsgId={(msgId)=>{
                                                        dispatchThemeFn(data);
                                    setCheckedMsgId(msgId)
                                }}
                                                visibleRange={visibleRange}
                                                setCheckedMsgArr={(msgs) => setCheckedMsgArr(msgs)}

                            />
                        }}
                    />

                </div>
            </div>
            <IonLoading
                cssClass='my-custom-class'
                isOpen={showLoading}
                onDidDismiss={() => setShowLoading(false)}
                message={'Please wait...'}
                duration={60000}
            />

            {
                !showPin && <IonFab vertical="top" horizontal="end" slot="fixed">
                    {
                        !!onSubscribe &&
                        <div className="fab-cus" onClick={() => {
                            onSubscribe(!subscribed)
                        }}>
                            {
                                subscribed === false ? <img src="assets/img/fab-icon00004.png" width={32} height={32}
                                                            style={{verticalAlign: "middle"}}/>
                                    :
                                    <img src="assets/img/fab-icon00001.png" width={32} height={32}
                                         style={{verticalAlign: "middle"}}/>
                            }
                        </div>
                    }
                </IonFab>
            }

            {
                comments.length - 1 > currentVisibleStopIndex && !showPin && !isScrolling &&
                <IonFab vertical="center" horizontal="end" slot="fixed" style={{
                    // bottom: !pinnedStickies ? '145px' : "100px",
                    right: !pinnedStickies ? "" : "35px",
                    cursor: 'pointer'
                }}>
                    <div>
                        {
                            visibleRange.startIndex > 5 &&
                            <div className="fab-cus" onClick={() => {
                                setAtBottom(false);
                                if (firstItemIndex < 1) {
                                    scrollToItem({index: 0, align: "start"})
                                } else {
                                    fetchMsgByIndex(0).catch(e => console.error(e))
                                }
                            }}>
                                <img src="assets/img/fab-icon00003.png" width={32} height={32}
                                     style={{verticalAlign: "middle"}}/>
                            </div>
                        }
                        {
                            !pinnedStickies &&
                            <div className="fab-cus-dig"
                                 style={(total - 1 - maxVisibleIndex <= 0) ? {
                                     background: "transparent",
                                     height: 0
                                 } : {marginTop: 6}}>
                                <small>{total - 1 - maxVisibleIndex <= 0 ? "" : total - 1 - maxVisibleIndex}</small>
                            </div>
                        }

                        {
                            (!atBottom || visibleRange.endIndex < total - 3) && (
                                <div className="fab-cus" onClick={() => {
                                    setAtBottom(true);
                                    if (comments && comments.length > 0 && (comments[comments.length - 1] as PinnedSticky).records[0].msgIndex == total - 1) {
                                        scrollToItem({index: total - 1, align: "end"})
                                    } else {
                                        fetchMsgByIndex(total - 1, true).catch(e => console.error(e))
                                    }

                                }}>
                                    <img src="assets/img/fab-icon00002.png" width={32} height={32}
                                         style={{verticalAlign: "middle"}}/>
                                </div>
                            )}

                    </div>
                </IonFab>
            }

            <ShareEx stickyMsg={stickyMsg} isOpen={showShareModal} showHistory={true}
                     onClose={() => setShowShareModal(false)}
                     tribeInfo={tribeInfo} latestMsg={shareMsgs} roles={shareRoles as Array<TribeRole>} owner={owner}/>

            <IonModal isOpen={!!showModifyMsg} className="role-select-list" onDidDismiss={() => setShowModifyMsg(null)}
                      swipeToClose>
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


export const MessageContentVisualso = React.memo(MessageContentVisualsoChild);