import * as React from 'react';
import {Message, MessageStatus, MessageType, MsgText} from "../../../../../types";
import {IonAvatar, IonBadge, IonCheckbox, IonIcon, IonText, useIonPopover} from "@ionic/react";
import {arrowUndoOutline, createOutline, imageOutline, thumbsUpOutline, trashOutline} from "ionicons/icons";
import {utils} from "../../../../../common";
import {Role} from "./Role";
import {PhotoProvider, PhotoView} from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import {ImageView} from "../../../../utils/ImageView";


interface Props {
    msg: Message;
    showPin: boolean;
    owner: string;
    keeper?: string;
    checked?: boolean;
    hideTime?: boolean;
    onSupport?: (msgId: string, f: boolean) => void;
}

// const PopoverList: React.FC<{
//     onHide: () => void;
//     isSystem:boolean;
//     msg:Message;
//     isSupported:boolean;
//     onSupport?: (msgId: string, f: boolean) => void;
//     onReplay?: (msg: Message) => void;
//     onEdit?: (msg: Message) => void;
//     onDelete?: (msg: Message) => void;
//     owner: string;
//     isOwner:boolean;
// }> = ({ onHide,isSystem,owner,msg,isOwner
//                              ,isSupported,onDelete,onReplay,onEdit,
//                              onSupport }) => (
//     <div style={{width: "100%",display: "flex"}}
//          className={isSystem || msg.msgType == MessageType.Role ? "flex-center" : ""}>
//         {
//             !msg.groupId && <div className={`support-bx ${msg.Supporters && isSupported?"support-bx-owner":""}`}  onClick={() => {
//                 if (!msg.groupId) {
//                     onHide();
//                     onSupport(msg.id, !isSupported   );
//                 }
//             }}>
//                 <IonIcon size="small" src={thumbsUpOutline} style={{transform: 'translateY(2px)'}}/>
//             </div>
//         }
//         {
//             onReplay && owner && <div className="support-bx" style={{width: '35px'}} onClick={() => {
//                 onHide();
//                 onReplay(msg)
//             }}>
//                 <IonIcon size="small" src={arrowUndoOutline} style={{transform: 'translate(0px,2px)'}}/>
//             </div>
//         }
//         {
//             onEdit && msg.msgType == MessageType.Text && isOwner &&
//             <div className="support-bx" style={{width: '35px'}} onClick={() => {
//                 onHide();
//                 onEdit(msg)
//             }}>
//                 <IonIcon size="small" src={createOutline} style={{transform: 'translate(0px,1px)'}}/>
//             </div>
//         }
//         {
//             onDelete && isOwner &&
//             <div className="support-bx" style={{width: '35px'}} onClick={() => {
//                 onHide();
//                 onDelete(msg)
//             }}>
//                 <IonIcon size="small" src={trashOutline} style={{transform: 'translate(0px,2px)'}}/>
//             </div>
//         }
//     </div>
// );

export const Text: React.FC<Props> = ({msg, onSupport,keeper,hideTime,checked,
                                           showPin,
                                          owner, }) => {

    const content: MsgText = msg.content as MsgText;
    const isSystem = !msg.role;
    const replayCtn: MsgText = msg.replayMsg && (msg.replayMsg.content as MsgText);

    const isOwner =  msg && owner == msg.owner && !msg.groupId
    const isOwnerPinned =  msg && owner == msg.owner && !!msg.groupId
    const isSupported = msg && msg.Supporters && msg.Supporters.indexOf(owner)>-1;
    // const [present, dismiss] = useIonPopover(PopoverList, {
    //     onHide: () => dismiss(),
    //     isSystem:isSystem,
    //     msg:msg,
    //     isSupported:isSupported,
    //     onSupport:onSupport,
    //     onReplay:onReplay,
    //     onEdit:onEdit,
    //     onDelete:onDelete,
    //     owner:owner,
    //     isOwner:isOwner
    // });

    const Keeper = () => <img src="./assets/img/keeper.png" height={14} style={{transform: 'translateY(1px)'}}/>


    // console.log("replayCtn.content",replayCtn && replayCtn.content , msg && msg.replayMsg && msg.replayMsg.msgType)

    const support = msg.support>0 && <div onClick={()=>{
        if(onSupport){
            onSupport(msg.id, true)
        }
    }}>
        <div className="support-display">
            <img src={isSupported?'./assets/img/support2.png':'./assets/img/support.png'} width={16} height={16}/><small style={{
                fontWeight:700
        }}>
            &nbsp;<IonText color={isSupported?"primary":""}>{msg.support}</IonText></small>
        </div>
    </div>

    const replayItem = replayCtn && msg.replayMsg && <div style={{minWidth:replayCtn && replayCtn.image && replayCtn.image.url?"150px":"50px",width: '100%', backgroundBlendMode: msg.role?"multiply":"screen"}} className={isOwner ?
        `${!msg.role?'replay-box replay-box-sender-norole-owner':'replay-box replay-box-sender'}`
        :`replay-box ${msg.role?'replay-box-receive':'replay-box-sender-norole'}`} >

        {
            msg.replayMsg.msgType == MessageType.Text ?
                <div style={{padding: '0 6px',width: '100%'}}>
                    <div style={{paddingBottom: '3px',minHeight: replayCtn && replayCtn.image && replayCtn.image.url ?'46px':'20px'}}>
                        <b>
                            <IonText color="dark">
                                {msg.replayMsg.actor?msg.replayMsg.actor.name:"Narrator"}
                            </IonText>
                        </b>
                        {
                            replayCtn.image && replayCtn.image.url && <div><IonIcon color="dark" src={imageOutline}/></div>
                        }
                    </div>
                    {
                        replayCtn.content && <div className="text-pre"  style={{width: '85%',overflow:"hidden",textOverflow:"ellipsis",whiteSpace: "nowrap"}}>
                                {replayCtn.content}
                        </div>
                    }
                    {
                        replayCtn.image && replayCtn.image.url &&  <div style={{position: 'absolute', top: 0, right: 0, padding: 6}}>
                            <ImageView url={replayCtn.image.url} width={replayCtn.image.width} height={replayCtn.image.height} disH={45} disW={45}/>
                        </div>
                    }
                </div>
                :
                msg.replayMsg.msgType == MessageType.Role &&
                <div style={{maxWidth:'300px'}}>
                    <Role msg={msg.replayMsg} showPin={false}/>
                </div>
        }
    </div>
    return <div style={{width: '100%'}} className={isSystem ? `box msg-no-role` : `box`} >

        {
            showPin && <div className="pin-check">
                <IonCheckbox name="pinMsgId" checked={checked} value={msg.id} />
            </div>
        }

        {
            msg.msgType == MessageType.Text ?
                <>
                    {
                        msg && msg.role ? <>
                            <div className="avatar">
                                {
                                    !hideTime && msg && msg.actor && !!msg.actor.avatar ? <IonAvatar className="ion-avatar">
                                        <img src={utils.getDisPlayUrl(msg.actor && msg.actor.avatar)} width={30}/>
                                    </IonAvatar>:<div style={{width: '48px'}}></div>
                                }
                            </div>
                            <div style={{maxWidth: '85%'}}>
                                {
                                    !hideTime ? <div style={{textAlign: isOwner ? "right" : "left",padding: "3px"}}>
                                        <b style={{fontSize: '16px'}}>
                                            {keeper && <><IonText>{msg.actor && msg.actor.name}</IonText>&nbsp;{
                                            // msg.owner == keeper && !msg.groupId && <Keeper/>
                                        }</>}</b> <span style={{fontSize: '11px'}}><IonText
                                        color="medium">{utils.dateFormat(new Date(msg.timestamp * 1000))} </IonText></span>
                                    </div>:<div style={{height:"1px"}}>&nbsp;</div>
                                }
                                <div className={isOwner?"support-outer-owner":"support-outer"}>
                                    <div style={{position: "relative", width: '100%'}}>
                                        {
                                            content.content &&
                                            <div style={{width: '100%',position: "relative", border: isOwnerPinned?"1px solid #D8F20C":"0"}} className={isOwner ? "msg-text-sender": "msg-text-receive"}>
                                                {replayItem}
                                                <div style={{padding:'0px 6px 0px'}}>
                                                    <div className="text-pre">
                                                        {content.content}
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        {
                                            content.image && content.image.url &&  <div style={{borderRadius:12,background: "inherit", padding:0,textAlign: isOwner ?"right":"left", border: isOwnerPinned?"1px solid #D8F20C":"0"}}
                                                                                        className={owner != msg.owner ? "msg-text-receive" : ""}>
                                                <ImageView url={content.image.url} width={content.image.width} height={content.image.height} />
                                            </div>
                                        }
                                        {
                                            msg && (msg.msgStatus == MessageStatus.draft || msg.msgStatus == MessageStatus.removed) &&  <div className="removed">
                                                <IonBadge color="danger"><IonIcon src={trashOutline}/></IonBadge>
                                            </div>
                                        }
                                    </div>
                                    {support}

                                </div>


                            </div>
                        </> : <div style={{width: '100%'}}>
                            {
                                !hideTime ?<div>
                                <span style={{fontSize: '11px'}}>
                                    {keeper && msg.owner == keeper && !msg.groupId && <Keeper/>} <IonText color="medium">{utils.dateFormat(new Date(msg.timestamp * 1000))}</IonText>
                                </span>
                                </div>:<div style={{height:"1px"}}></div>
                            }
                            <div className="support-outer">
                                <div className={isOwner?'no-role-div-owner': "no-role-div"} style={{position: "relative",
                                    background: content.image  && content.image.url && !content.content &&
                                        "inherit", border: isOwnerPinned?"1px solid #D8F20C":"0"}}>
                                    {
                                        content.image  && content.image.url && <div style={{ borderRadius:12, padding:0 }}>
                                           <ImageView url={content.image.url} width={content.image.width} height={content.image.height} />
                                        </div>
                                    }
                                    {
                                        content.content && <div style={{padding: '5px'}}>
                                            {replayItem}
                                            <div style={{padding:'0 6px'}}>
                                                <div className="text-pre">
                                                    {content.content}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {
                                        msg && (msg.msgStatus == MessageStatus.draft || msg.msgStatus == MessageStatus.removed) &&  <div className="removed">
                                            <IonBadge color="danger"><IonIcon src={trashOutline}/></IonBadge>
                                        </div>
                                    }
                                </div>
                                {support}
                            </div>
                        </div>
                    }
                </> : <div>
                    {
                        msg.msgType == MessageType.Role && <div className="support-outer" >
                            <div>
                                <Role msg={msg} showPin={showPin} isOwner={msg && msg.owner == owner}/>
                            </div>
                            {support}
                        </div>
                    }

                </div>
        }

    </div>
}