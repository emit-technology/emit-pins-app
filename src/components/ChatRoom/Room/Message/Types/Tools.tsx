import {Message, MessageType, MsgText} from "../../../../../types";
import {IonIcon} from "@ionic/react";
import {arrowUndoOutline, createOutline, shareOutline, thumbsUpOutline, trashOutline} from "ionicons/icons";
import * as React from "react";


interface Props {
    msg: Message;
    keeper: string;
    showPin: boolean;
    owner: string;
    onSupport: (msgId: string, f: boolean) => void;
    onReplay: (msg: Message) => void;
    onEdit: (msg: Message) => void;
    onDelete: (msg: Message) => void;
    isChecked: boolean;
    onShare?: (msg: Message)=>void;
}

export const Tools:React.FC<Props> = ({msg,isChecked,showPin, onReplay,
                                   onEdit, onDelete,onShare,
                                   owner, onSupport,})=>{

    const isSystem = !msg.role;
    const isOwnerAndNotPinned =  msg && owner == msg.owner && !msg.groupId
    const isSupported = msg && msg.Supporters && msg.Supporters.indexOf(owner)>-1;

    return isChecked && !showPin && <div className={isSystem || msg.msgType == MessageType.Role ? "flex-center tool-no-role" : "tools"}>
        {
            (onSupport && msg && (!msg.support || msg.support == 0)) && !msg.groupId && !isSupported && <div className={`support-bx ${msg.Supporters && isSupported?"support-bx-owner":""}`}  onClick={() => {
                if (!msg.groupId) {
                    // onHide();
                    onSupport(msg.id, !isSupported   );
                }
            }}>
                {/*<IonIcon size="small" src={thumbsUpOutline} style={{transform: 'translateY(2px)'}}/>*/}
                <img src={'./assets/img/support.png'} width={18} height={18}/>
            </div>
        }
        {
            onReplay && owner && <div className="support-bx" onClick={() => {
                // onHide();
                onReplay(msg)
            }}>
                <IonIcon size="small" src={arrowUndoOutline} style={{pointerEvents: "none"}}/>
            </div>
        }
        {
            onEdit && msg.msgType == MessageType.Text && isOwnerAndNotPinned &&
            <div className="support-bx"  onClick={() => {
                // onHide();
                onEdit(msg)
            }}>
                <IonIcon size="small" src={createOutline} style={{pointerEvents: "none"}}/>
            </div>
        }
        {
            onDelete && msg.msgType !== MessageType.Airdrop && isOwnerAndNotPinned &&
            <div className="support-bx"  onClick={() => {
                // onHide();
                onDelete(msg)
            }}>
                <IonIcon size="small" src={trashOutline}  style={{pointerEvents: "none"}}/>
            </div>
        }
        {
            onShare  &&
            <div className="support-bx"  onClick={() => {
                // onHide();
                onShare(msg)
            }}>
                <IonIcon size="small" src={shareOutline}   style={{pointerEvents: "none"}}/>
            </div>
        }
    </div>
}
