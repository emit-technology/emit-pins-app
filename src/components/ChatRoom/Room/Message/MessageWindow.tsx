import * as React from 'react';
import {forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {GroupMsg, Message, MessageStatus, MessageType, PinnedSticky, TribeInfo} from "../../../../types";
import {Airdrop, Dice, Expression, Text} from "./Types";

import './message.scss';
import {useAppDispatch, useAppSelector} from "../../../../common/state/app/hooks";
import useVirtual from "react-cool-virtual";
import {saveDataState} from "../../../../common/state/slice/dataSlice";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonHeader,
    IonIcon,
    IonModal,
    IonTextarea,
    IonTitle,
    IonToolbar,
    useIonAlert
} from '@ionic/react';
import {
    arrowUndoOutline,
    chevronDownOutline,
    chevronUpOutline,
    createOutline,
    thumbsUpOutline,
    trashOutline
} from "ionicons/icons";
import {tribeService} from "../../../../service/tribe";
import UploadImage from "../../../utils/UploadImage";
import add from "../../../../img/add.png";
import config from "../../../../common/config";
import tribeWorker from "../../../../worker/imWorker";
import BigNumber from "bignumber.js";
import selfStorage from "../../../../common/storage";
import {Tools} from "./Types/Tools";
import {Align, ListOnItemsRenderedProps, VariableSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer"

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
}

const pageSize = 1000000;
let shouldFetchData = true;
let pageNo = 1;
let count = 0;
let total = 0;
let shouldScroll = 0;
let error_fetch_count = 0;
let shouldScrollToBottom = false;
let scrollInterVal: any;

let delaySaveCurrentVisibleIndex = 0;
let delaySaveMaxVisibleIndex = 0;

const mutexify = require('mutexify/promise')
const _lock = mutexify()

const fetchData = async (pageNo, setComments, condition?: Array<any>) => {

    try {
        // pageNo = pageNo < 1 ? 1 : pageNo;
        console.log("fetch data total == %d ,page=%d", total, pageNo)
        const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, pageNo, pageSize, condition)
        total = rest.data.length;
        // console.log("fetch data total ==", rest.data)
        // Pre-pend new items
        setComments((prevComments: Array<PinnedSticky>) => [...rest.data, ...[]]);
        // setComments(rest.data)
    } catch (err) {
        if (error_fetch_count++ < 50) {
            await fetchData(pageNo, setComments);
        }
        console.error(err, "fetchData error")
        // Try again
    }
};

const fetchNewPin = async (groupMsg: Array<GroupMsg>, pageNo: number, setComments: any) => {
    const grpmsg = await tribeService.groupIds(config.tribeId);
    if (grpmsg.length > groupMsg.length) {
        const groupIds = grpmsg.slice(groupMsg.length)
        for (let groupId of groupIds) {
            const condition = [
                "tribeIdAndGroupId", [config.tribeId, groupId], [config.tribeId, groupId]
            ]
            const rest = await tribeWorker.getPinnedMessageArray(config.tribeId, pageNo, pageSize, condition)
            setComments((prevComments: Array<PinnedSticky>) => [...prevComments, ...rest.data]);
        }
    }

}

function setCurrentVisible(visibleStartIndex: number) {
    selfStorage.setItem(`current_visible_index_${config.tribeId}`, visibleStartIndex)
}

function getCurrentVisible(): number {
    return selfStorage.getItem(`current_visible_index_${config.tribeId}`)
}

const GUTTER_SIZE = 8;
export const MessageContentWindow: React.FC<Props> = ({groupMsg, pinnedStickies, loaded, onReload, showPinnedMsgDetail, showPin, owner, tribeInfo, onSupport}) => {
    const dispatchData = useAppSelector(state => state.jsonData);
    const dispatch = useAppDispatch();
    const [comments, setComments] = useState([]);
    const [showModifyMsg, setShowModifyMsg] = useState(null);
    const [stickyMsg, setStickyMsg] = useState(null);
    const [checkedMsgArr, setCheckedMsgArr] = useState([])
    const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
    const [maxVisibleIndex, setMaxVisibleIndex] = useState(0);
    const [visibleStartIndex, setVisibleStartIndex] = useState(0);
    const [checkedMsgId, setCheckedMsgId] = useState("");

    const listRef = useRef({});
    const rowHeights = useRef({});

    const getRowHeight = (index:number) => {
        return rowHeights.current[index] + 8 || 82;
    }

    const setCurrentTimeout = () => {
        if (visibleStartIndex > 0 && delaySaveCurrentVisibleIndex++ == 0) {
            setTimeout(() => {
                // const stickyMsg:PinnedSticky = comments[currentVisibleIndex];
                console.log("visibleStartIndex============ `", visibleStartIndex)
                if (visibleStartIndex > 0) {
                    setCurrentVisible(visibleStartIndex);
                }
                delaySaveCurrentVisibleIndex = 0;
            }, 500)
        }
    }

    useEffect(() => {
        if (document.hidden !== undefined) {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    console.log("fetch page data")
                    fetchData(pageNo, setComments)
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
                    fetchData(pageNo, setComments).then(() => {
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
                                if (comment.records && comment.records.length > 0 && comment.records[0].msgType == MessageType.Pin) {
                                    // commentsCopy = commentsCopy.filter(v => v.groupId !== "")
                                    // fetchNewPin(groupMsg,pageNo,setComments).then(()=>{
                                    //     onReload(false);
                                    // }).catch(e=>console.error(e))
                                    {
                                        fetchData(pageNo, setComments).then(() => {
                                            onReload(false)
                                            // scrollToBottom();
                                        }).catch(e => console.error(e))
                                    }
                                } else if (comment.records && comment.records.length > 0 && comment.records[0].msgType == MessageType.UpdateTribe) {
                                    // if(total == 0){
                                    //     fetchData(pageNo, setComments)
                                    // }
                                    onReload(false);
                                } else {
                                    const _index = commentsCopy.findIndex(v => (v.records && v.records.length > 0 && comment.records.length > 0 && v.records[0].id == comment.records[0].id))
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

    const onItemRender = (e: ListOnItemsRenderedProps) => {
        if (!pinnedStickies) {
            setVisibleStartIndex(e.visibleStartIndex);
            setCurrentTimeout();
        }
        if (!pinnedStickies && currentVisibleIndex !== e.visibleStopIndex) {
            setCurrentVisibleIndex(e.visibleStopIndex);

            if (e.visibleStopIndex > maxVisibleIndex) {
                setMaxVisible(e.visibleStopIndex);
            }
            const data = comments[e.visibleStartIndex + 1];

            if (e.visibleStopIndex == comments.length - 1) {
                const data = comments[e.visibleStopIndex];
                setStickyMsg(data)
                dispatchTheme(data);
            } else if (e.visibleStartIndex == 0) {
                const data = comments[e.visibleStartIndex];
                setStickyMsg(data)
                dispatchTheme(data);
            } else {
                // const condition = data && stickyMsg && (stickyMsg.seq != data.seq);
                if (!stickyMsg && data || stickyMsg && data && (stickyMsg.seq != data.seq)) {
                    dispatchTheme(data);
                    setStickyMsg(data)
                }
            }

        }
    }

    useEffect(() => {
        if (!pinnedStickies && comments.length > 0) {

            console.log("scroll to last visit max=[%d], current=[%d] ", maxVisibleIndex, currentVisibleIndex)
            if (shouldScroll++ == 0) {
                const last = getCurrentVisible();
                console.log("scroll to last: ", last)
                if (last > 0) {
                    startItem(last);
                } else {
                    scrollToBottom();
                }
            } else {
                if (currentVisibleIndex >= comments.length - 2) {
                    scrollToBottom();
                }
            }

        }
    }, [comments.length]);

    // useEffect(() => {
    // if (!stickyMsg  && comments.length > 0) {
    //     const data = comments[0];
    //     setStickyMsg(data)
    //     // console.log("set data 5")
    //     dispatchTheme(data);
    // }

    // if(comments && comments.length >0){
    //     const msg:PinnedSticky = comments[comments.length - 1];
    //     if(msg && msg.records && msg.records.length>0){
    //         const record = msg.records[0];
    //         if(record.msgType !== MessageType.Role && record.msgType !== MessageType.Divide){
    //             groupByTime = {timestamp: record.timestamp, role: record.role}
    //         }
    //     }
    // }

    // }, [comments.length])


    const onReplay = (msg: Message) => {
        if (owner) {
            dispatch(saveDataState({data: JSON.stringify({msg: msg}), tag: 'replayMsg'}))
        }
    }

    useLayoutEffect(() => {
        if (owner && !pinnedStickies && dispatchData) {
            if (dispatchData.tag == 'scrollToItem' && dispatchData.data) {
                let dataObj = JSON.parse(dispatchData.data);
                console.log("-->>>>>>>>. scroll to item: ", dataObj)
                if (dataObj.refresh > -1) {
                    if (dataObj.refresh == 0) {
                        scrollToBottom();
                    } else if (dataObj.refresh == 666666) {
                        const index = comments.findIndex(v => v.groupId == "")
                        if (index > 0) {
                            const index2 = comments.findIndex(v => v.seq == comments[index - 1].seq)
                            // console.log(index,index2,comments[index - 1].seq);
                            if (index2 > -1) {
                                startItem(index2);
                            }
                        } else {
                            scrollToBottom();
                        }
                    } else {
                        const index = comments.findIndex(v => v.seq == dataObj.refresh)
                        console.log("-->>>>>>>>. index: ", index)
                        if (index > -1) {
                            startItem(index);
                        } else {
                            scrollToBottom();

                        }
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
            }
        }
    }, [dispatchData.data]);

    const scrollToBottom = () => {
        const dataLength = comments.length - 1;
        // console.log('scrollToBottom ====> len=%d, current=%d, max=%d',comments.length, currentVisibleIndex,maxVisibleIndex)
        if (comments.length > 0) {
            startItem(dataLength - 1)
            scrollToItem(dataLength, "end")
            setCurrentVisibleIndex(dataLength)
            setMaxVisible(dataLength);

            dispatchTheme(comments[comments.length - 1])
            // setCurrentTimeout();
        }
    }


    const renInboxMsg = (messages: Array<Message>, msgIndex: number, seq: number): Array<any> => {
        const htmls = [];
        if (messages && messages.length > 0) {
            messages.forEach((v, index) => {
                let item;

                // console.log("ren msg ==========>  ",v , v["hideTime"])
                if (msgIndex > 0 && !v["hideTime"]) {
                    const pre: PinnedSticky = comments[msgIndex - 1];
                    if (pre && pre.records && pre.records.length > 0) {
                        const preMsg = pre.records[0];
                        if (preMsg.msgType != MessageType.Divide && preMsg.msgType != MessageType.Role) {
                            v["hideTime"] = !!preMsg && preMsg.role == v.role && preMsg.groupId == v.groupId && (Math.floor(preMsg.timestamp / 300) == Math.floor(v.timestamp / 300)) ? 1 : 2;
                        }
                    }
                }
                if (v.msgType == MessageType.Text || v.msgType == MessageType.Role) {
                    let className = 'msg-no-role-rec';
                    if (v.role) {
                        className = owner == v.owner && !v.groupId ? "msg-sender" : "msg-receive"
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
                        <div className="inner" style={{maxWidth: '100%'}} onMouseOver={() => {
                            if (onSupport) {
                                setCheckedMsgId(v.id)
                            }
                        }}>
                            {/*<div>{msgIndex}</div>*/}
                            <Text hideTime={!!v["hideTime"] && v["hideTime"] == 1}
                                  keeper={tribeInfo && tribeInfo.keeper} checked={checked} msg={v} owner={owner}
                                  showPin={v.msgStatus == MessageStatus.dashed && showPin}
                            />

                        </div>

                        <Tools msg={v} showPin={v.msgStatus == MessageStatus.dashed && showPin} owner={owner}
                               onSupport={onSupport}
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
                } else if (v.msgType == MessageType.Airdrop) {
                    item = <Airdrop/>
                } else if (v.msgType == MessageType.Expression) {
                    item = <Expression/>
                } else if (v.msgType == MessageType.Divide) {
                    item = <div className="strike" key={index}>
                        {v.groupId ? <span>#{seq}</span> : <span>New Pin</span>}
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
    const setMaxVisible = (n: number) => {
        // console.log("set max visible=[%d]", n)
        setMaxVisibleIndex(n)
        selfStorage.setItem(`maxVisibleIndex_${config.tribeId}`, n)
    }

    const scrollToItem = (index: number, align: Align) => {
        //@ts-ignore
        listRef.current.scrollToItem(index, align);
    }

    const startItem = (index: number) => {
        //@ts-ignore
        scrollToItem(index, "start")
    }

    const setRowHeight = (index:number, size:number) => {
        //@ts-ignore
        listRef.current.resetAfterIndex(0);
        rowHeights.current = { ...rowHeights.current, [index]: size };
    }
    const Row = ({index ,style}) => {
        const rowRef = useRef();
        useEffect(() => {
            if (rowRef.current) {
                //@ts-ignore
                setRowHeight(index, rowRef.current.clientHeight);
            }
            // eslint-disable-next-line
        }, [rowRef]);

        const pinnedSticky: PinnedSticky = comments[index];

        if (pinnedSticky) {
            const isNewTheme = index > 0 && comments[index - 1] && (comments[index - 1] as PinnedSticky).records && (comments[index - 1] as PinnedSticky).records[0].msgStatus == MessageStatus.pinned
                && pinnedSticky.records && pinnedSticky.records[0].msgStatus == MessageStatus.dashed;

            // const theme = stickyMsg.theme;
            const messages = pinnedSticky.records

            const msgItems = renInboxMsg(messages, index, pinnedSticky.seq)
            return <div style={style} className="inner-box"  key={`_s_${index}`}>
                <div className="visual-msg-box"  ref={rowRef}>
                    {/*{showLoading && <Loading/>}*/}
                    {
                        isNewTheme &&
                        <div className="strike">
                            <span>New Pin</span>
                        </div>
                    }

                    <div className={"visual-msg-content"} style={{
                        top: 6, bottom: 6
                    }} onClick={(e) => {
                        // console.log("click msg")
                        e.stopPropagation();
                        e.persist();
                        const sticky = comments[index];
                        if (sticky && stickyMsg && sticky.seq != stickyMsg.seq) {
                            setStickyMsg(sticky)
                            dispatchTheme(sticky);
                        }
                        // setCheckedMsgId(sticky && (sticky as PinnedSticky).records && (sticky as PinnedSticky).records.length>0 && (sticky as PinnedSticky).records[0].id)
                    }}>
                        {msgItems}
                    </div>
                </div>
            </div>


        }

        return (
            <div
                ref={rowRef}
            >

            </div>
        );
    };

    //@ts-ignore
    const innerElementType = forwardRef(({style, ...rest}, ref) => {
        //@ts-ignore
        return <div ref={ref}
             style={{
                 ...style,
                 // paddingLeft: GUTTER_SIZE,
                 // paddingTop: GUTTER_SIZE
             }}
             {...rest}
        />
    });

    // console.log("comments.length - 1 > currentVisibleIndex : ",comments.length - 1 > currentVisibleIndex, comments.length -1, currentVisibleIndex, maxVisibleIndex )
    // console.log(" comments.length - 1 - maxVisibleIndex > 0 && maxVisibleIndex > 0: ",  comments.length - 1 - maxVisibleIndex > 0 && maxVisibleIndex > 0);
    return <div className={!pinnedStickies ? "msg-content" : "msg-content2"} style={{
        backgroundImage: `url(${stickyMsg && (stickyMsg as PinnedSticky).groupId ? stickyMsg.theme.image :
            pinnedStickies && pinnedStickies.data.length > 0 ? pinnedStickies.data[0].theme.image : tribeInfo && tribeInfo.theme.image})`,
    }}>


        <AutoSizer>
            {({height, width}) => (
                <List
                    height={height - 74}
                    itemCount={comments.length}
                    itemSize={getRowHeight}
                    //@ts-ignore
                    ref={listRef}
                    width={width}
                    className="outer-box"
                    onItemsRendered={onItemRender}
                >
                        {Row}
                </List>
            )}
        </AutoSizer>

        {
            comments.length - 1 > currentVisibleIndex &&
            <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{
                bottom: !pinnedStickies ? '145px' : "100px",
                right: !pinnedStickies ? "" : "35px",
                cursor: 'pointer'
            }}>
                <div className="fab-cus">
                    {
                        (comments.length - 1 > currentVisibleIndex && currentVisibleIndex > 10) &&
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
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                        {
                            showModifyMsg.content && <div>
                                <div style={{padding: '12px 0'}}>
                                    <div className="create-title">Message</div>
                                    <IonTextarea className="msg-input" rows={2} placeholder="Input your message"
                                                 autoGrow value={showModifyMsg.content.content} onIonChange={(e) => {

                                        const msgCopy = JSON.parse(JSON.stringify(showModifyMsg))
                                        msgCopy.content.content = e.target.value;
                                        setShowModifyMsg(msgCopy)
                                    }}/>
                                </div>
                                <div className="create-title">Image</div>
                                <div style={{
                                    borderRadius: '5px',
                                    // border: '1px solid var(--ion-color-medium)',
                                    padding: '12px',
                                    position: "relative",
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center'
                                }}>
                                    <UploadImage defaultIcon={add} height={200} width={'100%'}
                                                 imgUrl={showModifyMsg.content.image.url} setImgUrl={(url, w, h) => {
                                        const msgCopy = JSON.parse(JSON.stringify(showModifyMsg))
                                        msgCopy.content.image = {url: url, width: w, height: h}
                                        setShowModifyMsg(msgCopy)
                                    }}/>
                                </div>

                                <IonButton expand="block" onClick={() => {
                                    tribeService.updateMsg(showModifyMsg.id, '0x' + Buffer.from(JSON.stringify(showModifyMsg.content)).toString('hex')).then(() => {
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


}