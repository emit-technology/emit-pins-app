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
import {Dice, Expression, Text} from "./Types";

import './message.scss';
import {useAppDispatch, useAppSelector} from "../../../../common/state/app/hooks";
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
    arrowForwardOutline, at,
    createOutline,
    gitBranchOutline,
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
import {LoremIpsum} from "lorem-ipsum";
import {MessageItem} from "./MessageItem";
import VirtuosoScroller from "virtual-scroller/react";
import {ItemComponent} from "./ItemComponent";


const lorem = new LoremIpsum({
    wordsPerSentence: {
        max: 32,
        min: 4
    }
});


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
    onFork?: (groupId: string, forkTribeInfo: TribeInfo) => void;

    setHideMenu?: (f: boolean) => void;

    onChangeVisible?: (v: PinnedSticky) => void;

    firstIndex: number

    isConnecting?: WsStatus

    subscribed?: boolean;
    onSubscribe?: (f:boolean)=>void;
}

const pageSize = 200;
let pageNo = 1;
let count = 0;
let shouldScroll = 0;
let shouldScrollToBottom = false;
let delaySaveCurrentVisibleIndex = 0;
let loadCount = 0;

const currentMsgIndexKey = () => `current_msg_v2_index_${config.tribeId}`;

function setCurrentVisible(visibleStartId: number) {
    selfStorage.setItem(currentMsgIndexKey(), visibleStartId)
}

let visibleStartId = 0;

const setVisibleStartIndex = (id: number) => {
    visibleStartId = id
}

const mutexify = require('mutexify/promise')
const _lock = mutexify()

const isAPP = false// utils.isSafari();

let renderCount = 0;

const MessageContentVisualsoChild: React.FC<Props> = ({
                                                                 groupMsg
                                                                 , isConnecting, firstIndex,
                                                                 onChangeVisible,
                                                                 setHideMenu, onFork,
                                                                 shareMsgId, userLimit,
                                                                 selectRole, pinnedStickies,
                                                                 loaded, onReload, showPinnedMsgDetail,
                                                                 showPin, owner,
                                                                 tribeInfo, onSupport, subscribed, onSubscribe
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
    const [loadingData, setLoadingData] = useState(false)

    const [firstItemIndex, setFirstItemIndex] = useState(0)
    const [total, setTotal] = useState(0)

    const getCurrentVisible = (): number => {
        const id = selfStorage.getItem(currentMsgIndexKey());
        return !id ? -1 : id;
    }

    // useLayoutEffect(() => {
    //     const doc = document.querySelectorAll('[data-virtuoso-scroller=true]');
    //     if (doc && doc.length > 0) {
    //         doc[0].className = "customer-scroll";
    //     }
    // }, [])

    useEffect(() => {
        fetchMsgByIndex(firstIndex).catch(e => console.error(e))
    }, [firstIndex])

    useEffect(() => {
        if (!!shareMsgId) {
            tribeService.msgInfo(shareMsgId).then(msgInfo => {
                fetchMsgByIndex(msgInfo.msgIndex).catch(e => console.error(e))
            })
        }
    }, [shareMsgId])

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

    const setCurrentTimeout = (f: boolean) => {
        // console.log("visibleStartId == ", visibleStartId)
        if (visibleStartId && delaySaveCurrentVisibleIndex++ == 0) {
            setTimeout(() => {
                setCurrentVisible(visibleStartId);
                delaySaveCurrentVisibleIndex = 0;
            }, 10)
        }
    }


    const combile = (comp: Array<PinnedSticky>) => {
        if (!comp || comp.length == 0) {
            return;
        }
        let msgIndex = comp[0].records[0].msgIndex;
        let groupByTime: { role: string, timestamp: number, groupId: string, owner: string } = null;
        let lastPin: PinnedSticky = null;
        for (let i = 0; i < comp.length; i++) {
            let pMsg = comp[i];
            const nextMsg = i < comp.length ? comp[i + 1] : null
            if ((pMsg as PinnedSticky).records && (pMsg as PinnedSticky).records[0]) {
                const msg: Message = (pMsg as PinnedSticky).records[0];
                if (msg.msgType !== MessageType.Role) {
                    msg.hideTime = !!groupByTime && groupByTime.role == msg.role && groupByTime.groupId == msg.groupId && (Math.floor(groupByTime.timestamp / 300) == Math.floor(msg.timestamp / 300));

                    if (groupByTime && tribeInfo && (
                        groupByTime.owner == tribeInfo.keeper && msg.owner !== tribeInfo.keeper ||
                        groupByTime.owner !== tribeInfo.keeper && msg.owner == tribeInfo.keeper
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
                lastPin: pMsg,
                showPin: lastPin && lastPin.groupId !== pMsg.groupId,
                showFork: nextMsg && nextMsg.groupId !== pMsg.groupId
            };

            lastPin = pMsg;
        }
    }


    const fetchMsgByIndex = async (firstIndex: number, toBottom: boolean = false) => {
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
            const comp = rest.data;
            // console.log("======== comments: ", comments);
            combile(comp);

            setTotal(pre => {
                return rest.total
            });
            setComments(comp)
            setFirstItemIndex(reqIndex)
            console.log("------> firstItemIndex: [%d]", reqIndex, comp.length > 0 && comp[0])

            if (toBottom) {
                scrollToItem({index: rest.total, align: "end"});
            } else {
                scrollToItem({index: firstIndex - reqIndex, align: "start"});
            }

        }
    }

    const initLatestPin = async () => {

        const streamMsg1 = await tribeWorker.getPinnedMessageArray(config.tribeId, 0, 2);
        if (streamMsg1 && streamMsg1.total == 0) {
            const defaultThem = await tribeService.defaultTheme();
            dispatchTheme(defaultThem)
        } else {
            let latestId = getCurrentVisible();
            if (latestId == -1) {
                latestId = pageSize < streamMsg1.total ? streamMsg1.total - pageSize + 1 : 0;
            }
            if (latestId >= streamMsg1.total) {
                latestId = streamMsg1.total - 1;
            }
            console.log("=========initLatestPin >> start=[%d], end=[%d] ", latestId, pageSize);
            const data = await tribeWorker.getPinnedMessageArray(config.tribeId, latestId, pageSize);
            const comp = data.data;
            combile(comp)
            console.log("=========initLatestPin >> start=[%d], end=[%d], data=[%d] ", latestId, pageSize, data.data.length);
            setComments(comp)
            setTotal(pre => {
                console.log("------> tribeWorker set total 5 ==  ", pre, data.total)
                return data.total
            });
            console.log("------> firstItemIndex: [%d], initLatestPin", latestId)
            setFirstItemIndex(latestId);
        }
    }

    const activePage = async () => {
        console.log("=========activePage >> data=[%d] ", comments.length);
        if (comments.length > 0) {
            const lastMsg: PinnedSticky = comments[comments.length - 1];
            if (lastMsg) {
                loadMore(lastMsg.records[0].msgIndex)
            }
        }
    }

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
                    combile(comp);
                    return comp
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
            console.log("=========loadMore >> start=[%d], end=[%d] ", lastMsg.records[0].msgIndex + 1, pageSize, comments);
            if (
                (!!lastMsg && !!lastMsg.records && !!lastMsg.records[0].msgIndex && lastMsg.records[0].msgIndex < total - 1)
            ) {
                tribeWorker.getPinnedMessageArray(config.tribeId, lastMsg.records[0].msgIndex + 1, pageSize).then(rest => {
                    if (rest.data.length > 0) {
                        console.log("=========loadMore >> start=[%d], end=[%d] , data=[%d] ", lastMsg.records[0].msgIndex + 1, pageSize, rest.data.length);
                        setTotal(pre => {
                            console.log("=========loadMore >> set total 6 ==  ", pre, rest.total)
                            return pre < rest.total ? rest.total : pre;
                        });
                        setComments(pre => {
                            let comp = [...pre]
                            if(pre.length>0 && rest.data.length>0 && pre[pre.length - 1].records[0].msgIndex > rest.data[0].records[0].msgIndex){
                                for(let msg of rest.data){
                                    if(comp && comp.findIndex(v=>v.records[0].msgIndex == msg.records[0].msgIndex) == -1){
                                        comp.push(msg)
                                    }
                                }
                            }else{
                                comp = [...pre, ...rest.data]
                            }
                            combile(comp);
                            return comp
                        })
                    }
                }).catch(e => console.error(e))
            }
        }
    }, [comments, total, setComments, setTotal])

    // useEffect(() => {
    //     if (document.hidden !== undefined && !pinnedStickies) {
    //         document.addEventListener('visibilitychange', () => {
    //             if (!document.hidden) {
    //                 //TODO
    //                 // fetchData(pageNo)
    //                 // activePage()
    //             }
    //         })
    //     }
    // }, [])

    useEffect(() => {
        console.log("init component ...")
        if (!pinnedStickies) {
            {
                const max = selfStorage.getItem(`maxVisibleIndex_${config.tribeId}`);
                setMaxVisibleIndex(max ? max : 0)
            }
        } else {
            const comp = pinnedStickies.data;
            combile(comp);
            console.log(comp)
            setComments(comp)
            setTotal(pinnedStickies.data.length)
        }
    }, [loaded])

    const dispatchTheme = useCallback((data: PinnedSticky) => {

        if (data && !!onChangeVisible && (!stickyMsg || data.groupId != stickyMsg.groupId)) {
            onChangeVisible(data)
            setStickyMsg(data);
        }
    }, [stickyMsg])

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
            if (shouldScroll++ == 0) {
                // const lastId = comments.findIndex(value => (value as PinnedSticky).records && (value as PinnedSticky).records && (value as PinnedSticky).records.length > 0 && (value as PinnedSticky).records[0].id == shareMsgId);
                const last = getCurrentVisible();
                if (last >= 0) {
                    setTimeout(() => {
                        if (last == 999999999) {
                            const itm = comments.length - 1;
                            const data = comments[itm];
                            dispatchTheme(data);
                            startItem(itm);
                        } else {
                            const data = comments[last];
                            dispatchTheme(data);
                        }

                    }, 100)
                } else {
                    setTimeout(() => {
                        // scrollToBottom();
                    }, 100)
                }
            } else {
                if (currentVisibleStopIndex >= comments.length - 5 || shouldScrollToBottom) {
                    setTimeout(() => {
                        // scrollToBottom();
                    }, 100)
                }
            }

        } else {

        }
    }, []);

    const onReplay = (msg: Message) => {
        if (owner) {
            setReplayMsg(msg)
            dispatch(saveDataState({data: JSON.stringify({msg: msg}), tag: 'replayMsg'}))
        }
    }

    useEffect(() => {
        if (loaded && loadCount++ == 0) {
            initLatestPin().then(() => {

            }).catch(e => console.error(e))
        }
    }, [loaded])


    useEffect(() => {
        if (loaded && count++ == 0) {
            tribeWorker.addMessageListener(config.tribeId, async (data: { total: number, messages: Array<PinnedSticky> }) => {
                try {
                    console.log("======> startcallbutton ", data)
                    setTotal(data.total)
                    const messages = data.messages;
                    if (messages && messages.length > 0) {
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
                                    onReload(false);
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
                                    onReload(false);
                                }

                                if (_comment.records && _comment.records.length > 0 && _comment.records[0].owner == owner) {
                                    onReload(true);
                                }

                            }
                            // console.log("=========> commentsCopy>>>", commentsCopy, nextComments);
                            const _cIndex = commentsCopy.findIndex(v => v.records[0].groupId == "");
                            if (_cIndex >= 0) {
                                const comp = [...commentsCopy, ...nextComments];
                                combile(comp)
                                return comp
                            }
                            combile(commentsCopy)
                            return commentsCopy
                        })
                    }
                } catch (e) {
                    console.error(e)
                }
            });
        }
    }, [loaded, setComments, setTotal])

    useEffect(() => {
        if (!pinnedStickies && dispatchData) {
            if (dispatchData.tag == 'scrollToItem' && dispatchData.data) {
                // virtuoso.current.scrollToIndex({ index: comments.length - 1, behavior: 'smooth' });
                if (comments && comments.length > 0 && (comments[comments.length - 1] as PinnedSticky).records[0].msgIndex == total - 1) {
                    scrollToItem({index: total - 1, align: "end"})
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
            }
        }
    }, [dispatchData.data]);

    const setMaxVisible = (n: number) => {
        // console.log("set max visible=[%d]", n)
        setMaxVisibleIndex(n)
        selfStorage.setItem(`maxVisibleIndex_${config.tribeId}`, n)
        // const data: PinnedSticky = comments[n];
        // if (data) {
        //     // selfStorage.setItem(`latest_view_${config.tribeId}`, data.records && data.records.length > 0 && data.records[0].timestamp)
        // }
    }


    const onShare = useCallback((msg: Message) => {
        // console.log("====> share msg: ", msg, new Date(msg.timestamp * 1000))
        tribeWorker.getPinnedMessageArray(config.tribeId, msg.msgIndex, 20).then(rest=>{
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

    },[setShowShareModal,setShareMsgs,setShareRoles])

    const _url = stickyMsg && (stickyMsg as PinnedSticky).groupId ? stickyMsg.theme.image :
        pinnedStickies && pinnedStickies.data.length > 0 ? pinnedStickies.data[0].theme.image : tribeInfo && tribeInfo.theme.image

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

    const Loading = () => <div style={{width: '100%', textAlign: 'center', padding: 12}}>⏳ Loading...</div>;

    // setting 'auto' for behavior does help in this sample, but not in my actual code
    const followOutput = useCallback((isAtBottom) => {
        // console.log('MessagesList: followOutput isAtBottom', isAtBottom, atBottom);
        const check = comments.length > 0 && (comments[comments.length - 1] as PinnedSticky).records && (comments[comments.length - 1] as PinnedSticky).records[0].msgIndex >= total - 5;
        return isAtBottom && atBottom && check ? 'auto' : false;
    }, [comments, atBottom, total]);

    const bottomChange = useCallback((bottom) => {
        if (bottom) {
            console.log("bottom")
        }
        setAtBottom(bottom)
    }, [setAtBottom])

    return <>

        <VirtuosoScroller
            items={comments}
            itemComponent={ItemComponent}
            preserveScrollPositionOnPrependItems
        />
    </>

}


export const MessageContentVirtualScroller = React.memo(MessageContentVisualsoChild);