import * as React from 'react';
import {Message, MessageType, MsgText, MsgTextImage} from "../../../types";
import {utils} from "../../../common";
import {ImageView} from "../ImageView";
import {IonIcon} from "@ionic/react";
import {imageOutline} from "ionicons/icons";
import {Role} from "../../ChatRoom/Room/Message/Types/Role";
import {ShareAirdrop} from "./ShareAirdrop";
import {Airdrop} from "../../ChatRoom/Room/Message/Types";

interface Props {
    msg: Message
}

export const ShareReplay: React.FC<Props> = ({msg}) => {

    const content: MsgText = msg.content as MsgText;
    const replayCtn:any = msg.replayMsg.content;
    return <>
            <div style={{
                minWidth: replayCtn && replayCtn.image && replayCtn.image.url ? "150px" : "50px",
                width: '93%',
                borderRadius: "45px",
                padding: "6px 12px",
                backgroundBlendMode: msg.role ? "multiply" : "screen"
            }} className="replay-box replay-box-receive">

                {
                    msg.replayMsg.msgType == MessageType.Text ?
                        <div style={{padding: '0 6px', width: '100%'}}>
                            <div style={{
                                minHeight: replayCtn && replayCtn.image && replayCtn.image.url ? '46px' : '20px'
                            }}>
                                <div style={{color: "#787B82"}}>
                                    {msg.replayMsg.actor ? msg.replayMsg.actor.name : "Narrator"}
                                </div>
                                {
                                    replayCtn.image && replayCtn.image.url &&
                                    <div><IonIcon color="dark" src={imageOutline}/></div>
                                }
                            </div>
                            {
                                replayCtn.content && <div className="text-pre" style={{
                                    width: '85%',
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    color: "#787B82"
                                }}>
                                    {replayCtn.content}
                                </div>
                            }
                            {
                                replayCtn.image && replayCtn.image.url &&
                                <div style={{position: 'absolute', top: 0, right: 0, padding: 6}}>
                                    <ImageView url={replayCtn.image.url} width={replayCtn.image.width}
                                               height={replayCtn.image.height} disH={45} disW={45}/>
                                </div>
                            }
                        </div>
                        :
                        msg.replayMsg.msgType == MessageType.Role ?
                            <div style={{maxWidth: '300px',wordBreak: "break-all"}}>
                                <Role msg={msg.replayMsg} showPin={false}/>
                            </div> :
                            msg.replayMsg.msgType == MessageType.Airdrop &&
                            <div style={{maxWidth: '300px',wordBreak: "break-all"}}>
                                <Airdrop msg={msg.replayMsg} owner={""} keeper={""}/>
                            </div>
                }
        </div>
    </>
}