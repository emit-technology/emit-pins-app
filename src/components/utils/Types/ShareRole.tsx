import * as React from 'react';
import {Message, MsgText, TribeRole} from "../../../types";
import {utils} from "../../../common";
import {Role} from "../../ChatRoom/Room/Message/Types/Role";

interface Props {
    msg: Message
}

export const ShareRole: React.FC<Props> = ({msg}) => {
    const content = msg.content as TribeRole;
    return <>
        <div className="share-content-role">
            <div style={{position: "relative"}}>
                <div style={{width: 58, height: 58, marginRight: 6}}>
                    <img src={utils.getDisPlayUrl(content.avatar)}
                         style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%"}}/>
                </div>
                <div>
                    <div className="share-role-name">{content.name}</div>
                    <div className="share-role-desc">{content.desc}</div>
                </div>
                <div className="share-role-tag">{content.origin?"update role": "new role"}</div>
            </div>
        </div>
    </>
}