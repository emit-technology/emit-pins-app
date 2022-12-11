import {useEffect, useLayoutEffect, useMemo, useState} from "react";
import {Message, MessageStatus, MessageType, PinnedSticky, TribeInfo, UserLimit} from "../../../../types";
import selfStorage from "../../../../common/storage";
import {Dice, Expression, Text} from "./Types";
import {Tools} from "./Types/Tools";
import {tribeService} from "../../../../service/tribe";
import {IonButton, IonButtons, IonIcon} from "@ionic/react";
import config from "../../../../common/config";
import {gitBranchOutline} from "ionicons/icons";
import * as React from "react";
import {Components} from "react-virtuoso";
import useResizeObserver from '@react-hook/resize-observer'

const useSize = (target) => {
    const [size, setSize] = React.useState(null)

    React.useLayoutEffect(() => {
        setSize(target.current.getBoundingClientRect())
    }, [target])

    //@ts-ignore Where the magic happens
    useResizeObserver(target, (entry) => setSize(entry.contentRect))
    return size
}

export const HeightPreservingItem:Components["Item"] = ({ children, ...props }) => {
    const [size, setSize] = useState(0)
    const knownSize = props['data-known-size']
    useEffect(() => {
        setSize((prevSize) => {
            return knownSize == 0 ? prevSize : knownSize
        })
    }, [knownSize])
    return (
        <div {...props}
            className="height-preserving-container"
            // check styling in the style tag below
            style={{ height: `${size}px`}}
        >
            {children}
        </div>
    )
}


interface Props {
    index: number;
    pinnedSticky: PinnedSticky;
    total: number;
    atBottom:boolean;
    firstItemIndex: number,

    pinnedStickies?: { data: Array<PinnedSticky>, total: number }
    checkedMsgArr: Array<string>
    showPin: boolean
    owner: string
    tribeInfo?: TribeInfo
    onSupport?: (msgId: string, f: boolean) => void;
    checkedMsgId?: string
    onFork?: (groupId: string, forkTribeInfo: TribeInfo) => void;

    setSize?: (index:number, size:number) =>void;
    windowWidth?:number
    stickyMsg?:PinnedSticky
    dispatchTheme?: (pin: PinnedSticky)=>void;
    setCheckedMsgId?: (msgId: string) => void;

    onShare?: (msg:Message) =>void;
    userLimit?: UserLimit;
    onReplay?: (msg:Message) =>void;
    onEdit?: (msg: Message)=>void;
    setCheckedMsgArr?:(msg:Array<string>)=>void;
    visibleRange?: {startIndex: number, endIndex: number}
}

const MessageItemChild:React.FC<Props> = ({ index,onSupport, pinnedSticky,
                                                total, atBottom, firstItemIndex,
                                                pinnedStickies, tribeInfo, checkedMsgArr,
                                                showPin, owner,checkedMsgId,onFork, setSize,windowWidth,
                                                stickyMsg,dispatchTheme, setCheckedMsgId,
                                                onReplay,onEdit,setCheckedMsgArr,
                                                onShare,userLimit,visibleRange}) => {
    const arrIndex = index - firstItemIndex;
    const preIndex = arrIndex - 1;
    //
    const target = React.useRef(null)

    // const size:any = useSize(target);

    // if(!!size){
    //     console.log(" size 222:  index=[%d], height=[%d], msgIndex=[%d]  ", index, size["height"], pinnedSticky.records[0].msgIndex )
    // }
    //
    // useLayoutEffect(() => {
    //
    //     if(!!setSize && size){
    //         // console.log(target.current)
    //         const height = size["height"]; //target.current.getBoundingClientRect().height;
    //         console.log(" size111:  index=[%d], height=[%d], msgIndex=[%d] " , index , height,  pinnedSticky.records[0].msgIndex );
    //
    //         setSize(index, height);
    //     }
    // }, [setSize, size, windowWidth]);

    if (!!pinnedSticky) {
        return (
            <div ref={target} className="visual-msg-box"
                 style={{padding: atBottom && index >= total - 1 && index == visibleRange.endIndex ? "0 0 44px" : "0" }}
                 key={index}>

                {/*<small>{pinnedSticky.records[0].msgIndex}</small>*/}

                {
                    firstItemIndex == 0 && preIndex == -1 && !pinnedStickies && <div style={{paddingTop: 20}}>
                        <div className="strike">
                            <span>{!pinnedSticky.groupId ? "New Tape" : `#1`}</span>
                        </div>
                    </div>
                }


                {
                    !!pinnedSticky.showPin && pinnedSticky.showPin.showPin && <>
                        {
                            !pinnedStickies && <div className="strike">
                                <span>{!pinnedSticky.groupId ? "New Tape" : `#${pinnedSticky.showPin.lastPin.seq}`}</span>
                            </div>
                        }
                    </>
                }

                {/*<div>*/}
                <div className={"visual-msg-content"} onClick={(e) => {
                    e.stopPropagation();
                    e.persist();
                    if (!pinnedStickies && !!dispatchTheme && pinnedSticky && stickyMsg && pinnedSticky.groupId != stickyMsg.groupId) {
                        // setStickyMsg(sticky)
                        dispatchTheme(pinnedSticky);
                    }
                }}>
                    {
                        pinnedSticky.records && pinnedSticky.records.length>0 && pinnedSticky.records.map((m,index)=>{
                            const v:Message = m; //JSON.parse(JSON.stringify(m));

                            if (v.msgType == MessageType.Text || v.msgType == MessageType.Role || v.msgType == MessageType.Airdrop) {
                                let className = 'msg-no-role-rec';
                                if (v.role) {
                                    className = owner == v.owner && !v.groupId ? "msg-sender" : "msg-receive"
                                }
                                if (v.msgType == MessageType.Role) {
                                    className = `${className} role-sp`
                                }
                                const checked = checkedMsgArr.indexOf(v.id) > -1;
                                return <div className={className} key={index} onClick={(e) => {
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

                                    <div className="inner" style={{maxWidth: '100%'}}
                                         onMouseOver={() => {
                                             if(!pinnedStickies){
                                                 setCheckedMsgId(v.id)
                                             }
                                         }}
                                    >
                                        {/*<div style={{backgroundColor: "green", padding: 12}}>{v.msgIndex} - It feels like there are more bot comments than real people on twitter now.</div>*/}
                                        <Text hovered={checkedMsgId == v.id} hideTime={!!m.hideTime}
                                              keeper={tribeInfo && tribeInfo.keeper} onSupport={onSupport}
                                              checked={checked || v.msgType == MessageType.Airdrop} msg={v}
                                              owner={owner}
                                              showTag={!!pinnedStickies}
                                              showPin={v.msgStatus == MessageStatus.dashed && showPin}
                                        >
                                            {
                                                !pinnedStickies && <>
                                                    <Tools onShare={(msg) => onShare(msg)} msg={v}
                                                           showPin={v.msgStatus == MessageStatus.dashed && showPin}
                                                           owner={owner}
                                                           onSupport={userLimit && userLimit.supportLeft > 0 && onSupport}
                                                           onReplay={(msg: Message) => {
                                                               onReplay(msg)
                                                           }} onEdit={(msg: Message) => {
                                                                onEdit(msg)
                                                            }} onDelete={(msg: Message) => {
                                                                tribeService.deleteMsg(msg.id).catch(e => {
                                                                    console.log(e, "tribe del msg")
                                                                })
                                                            }} isChecked={checkedMsgId == v.id}
                                                           keeper={tribeInfo && tribeInfo.keeper}
                                                    />
                                                </>
                                            }
                                        </Text>
                                    </div>
                                </div>
                            }
                        })
                    }
                </div>


                <div style={{
                    padding: '0px 12px',
                    display: "flex",
                    justifyContent: "flex-end",
                    height:  !!pinnedSticky.showPin && pinnedSticky.showPin.showFork && onFork?"100%":"0px",
                    overflow: "hidden"
                }}>
                    <div className="fork-icon">
                        <IonButtons>
                            <IonButton onClick={() => {
                                // setShowLoading(true)
                                // console.log(pinnedSticky.showPin)
                                onFork(pinnedSticky.showPin.lastPin.groupId, {
                                    tribeId: config.tribeId,
                                    keeper: "",
                                    lastPinedSeq: pinnedSticky.showPin.lastPin.seq,
                                    onlineUser: 0,
                                    theme: pinnedSticky.showPin.lastPin.theme,
                                    title: tribeInfo.title,
                                    desc: "",
                                    themeTag: pinnedSticky.showPin.lastPin.theme.themeTag,
                                    themeDesc: pinnedSticky.showPin.lastPin.theme.themeDesc,
                                })
                            }}><IonIcon src={gitBranchOutline} style={{
                                color: "#4C89F8",
                                fontSize: "24px"
                            }}/></IonButton>
                        </IonButtons>
                    </div>
                </div>

                {
                    pinnedSticky.records[0].msgIndex == total - 1 && !!pinnedSticky.records[0].groupId &&
                    <>
                        {/*<div style={{*/}
                        {/*    padding: '6px 12px',*/}
                        {/*    display: "flex",*/}
                        {/*    justifyContent: "flex-end"*/}
                        {/*}}>*/}
                        {/*    <div className="fork-icon">*/}
                        {/*        <IonButtons>*/}
                        {/*            <IonButton onClick={() => {*/}
                        {/*                onFork(pinnedSticky.records[0].groupId, {*/}
                        {/*                    tribeId: config.tribeId,*/}
                        {/*                    keeper: "",*/}
                        {/*                    lastPinedSeq: 0,*/}
                        {/*                    onlineUser: 0,*/}
                        {/*                    theme: pinnedSticky.theme,*/}
                        {/*                    title: tribeInfo.title,*/}
                        {/*                    desc: "",*/}
                        {/*                    themeTag: pinnedSticky.theme.themeTag,*/}
                        {/*                    themeDesc: pinnedSticky.theme.themeDesc,*/}
                        {/*                })*/}
                        {/*            }}><IonIcon src={gitBranchOutline} style={{*/}
                        {/*                color: "#4C89F8",*/}
                        {/*                fontSize: "24px"*/}
                        {/*            }}/></IonButton>*/}
                        {/*        </IonButtons>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <div className="strike">
                            <span>New Tape</span>
                        </div>
                    </>
                }
            </div>
        )
        // if (pinnedSticky.records && pinnedSticky.records.length > 0
        //     && ((pinnedSticky.records[0].msgStatus !== MessageStatus.removed && pinnedSticky.records[0].msgStatus !== MessageStatus.draft)
        //         || (!!pinnedStickies && pinnedSticky.records[0].msgStatus == MessageStatus.draft))) {
        //     const arrIndex = index - firstItemIndex;
        //     const preIndex = arrIndex - 1;
        //     // renInboxMsg(messages)
        //     // return <div style={{backgroundColor: "green", padding: 12}}>{index} - It feels like there are more bot comments than real people on twitter now.</div>
        //     return
        // } else {
        //     return <div></div>
        // }
    } else {
        return <div>Invalid data</div>
    }

}

export const MessageItem = React.memo(MessageItemChild);