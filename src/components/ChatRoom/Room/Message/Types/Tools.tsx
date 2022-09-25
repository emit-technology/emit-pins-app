import {Message, MessageType, MsgText} from "../../../../../types";
import {IonIcon} from "@ionic/react";
import {arrowUndoOutline, createOutline, thumbsUpOutline, trashOutline} from "ionicons/icons";
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
}

export const Tools:React.FC<Props> = ({msg,isChecked,showPin, onReplay,
                                   onEdit, onDelete,
                                   owner, onSupport,})=>{

    const isSystem = !msg.role;
    const isOwner =  msg && owner == msg.owner && !msg.groupId
    const isSupported = msg && msg.Supporters && msg.Supporters.indexOf(owner)>-1;

    return isChecked && !showPin && <div className={isSystem || msg.msgType == MessageType.Role ? "flex-center tool-no-role" : "tools"}>
        {
            !msg.groupId && !isSupported && <div className={`support-bx ${msg.Supporters && isSupported?"support-bx-owner":""}`}  onClick={() => {
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
                <IonIcon size="small" src={arrowUndoOutline} />
            </div>
        }
        {
            onEdit && msg.msgType == MessageType.Text && isOwner &&
            <div className="support-bx"  onClick={() => {
                // onHide();
                onEdit(msg)
            }}>
                <IonIcon size="small" src={createOutline}/>
            </div>
        }
        {
            onDelete && isOwner &&
            <div className="support-bx"  onClick={() => {
                // onHide();
                onDelete(msg)
            }}>
                <IonIcon size="small" src={trashOutline} />
            </div>
        }
    </div>
}
