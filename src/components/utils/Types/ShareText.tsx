import * as React from 'react';
import {Message, MsgText, MsgTextImage} from "../../../types";
import {utils} from "../../../common";
import {ShareReplay} from "./ShareReplay";

interface Props {
    msg: Message
}

export const ShareText: React.FC<Props> = ({msg}) => {

    const content: MsgText = msg.content as MsgText;
    let contentText = content && content.content;
    const isMind = contentText && contentText.indexOf("💭") == 0;

    return <>
        <div className="share-content-text">

           <div className={!msg.role ?"share-no-role":""} style={isMind ?{
               border: "1px dashed #fff",
               background: isMind ? "unset" : ""
           }:{}}>
               {
                   msg.role && <>
                       <div style={{marginRight: 4,width: 36, height: 36}}>
                           <img src={utils.getDisPlayUrl(msg.actor.avatar)} style={{borderRadius: "50%", width: "100%", height: "100%", objectFit: "cover"}}/>
                       </div>
                       <div className="share-content-text-right">
                           {
                               msg.replayMsg && <ShareReplay msg={msg}/>
                           }
                           <div style={{color: isMind?"#FFFFFF":"#A7A7A7"}}>{msg.actor.name}</div>
                           <div className="text-pre" style={{color: isMind?"#fff":"#000"}}>{content.content}</div>
                       </div>
                   </>
               }
               {
                   !msg.role && <div>
                       {
                           msg.replayMsg && <ShareReplay msg={msg}/>
                       }
                       <div className="text-pre">{content.content}</div>
                   </div>
               }
           </div>
        </div>
    </>
}