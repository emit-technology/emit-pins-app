import * as React from 'react';
import {Message, MessageType, MsgText, TribeRole} from "../../../../../types";
import {IonAvatar, IonIcon, IonItem, IonLabel, IonText} from "@ionic/react";
import {closeOutline} from "ionicons/icons";
import {utils} from "../../../../../common";

interface Props {
    msg: Message;
    onClose?:()=>void;
}

export const ReplayText: React.FC<Props> = ({msg,onClose}) => {

    if(msg.msgType == MessageType.Role){
        const content: TribeRole = msg.content as TribeRole;
        return <div>
            <IonItem className="replay-item" lines="none" color="secondary">
            {
                msg.actor && <IonAvatar slot="start">
                    <img src={utils.getDisPlayUrl(msg.actor.avatar)} />
                </IonAvatar>
            }
            <IonLabel>
                <div><b><small>{msg && msg.actor && msg.actor.name}</small></b></div>
                <div style={{float:'left'}}><small>Role: [{content.name}]</small></div>
            </IonLabel>
            {
                <IonIcon color="dark" size="small" src={closeOutline} onClick={()=>{
                onClose()
            }}/>}
        </IonItem>
        </div>
    }else{
        const content: MsgText = msg.content as MsgText;

        return <>
            {
                <IonItem className="replay-item" lines="none" color="secondary">
                    {
                        msg.actor && <IonAvatar slot="start">
                            <img src={utils.getDisPlayUrl(msg.actor.avatar)} />
                        </IonAvatar>
                    }
                    <IonLabel>
                        <div>
                            <IonText color="dark">
                                <b><small style={{color: '#000000'}}>{msg.actor && msg.actor.name}</small></b>
                            </IonText>
                        </div>
                        {
                            content.content && <div style={{overflow:"hidden",textOverflow:"ellipsis",width:'80%'}}><small>{content.content}</small></div>
                        }
                        {
                            content.image && content.image.url && <div style={{float:'left'}}>[image]</div>
                        }
                    </IonLabel>
                    {
                        onClose && <IonIcon color="dark" size="small" src={closeOutline} onClick={()=>{
                            onClose()
                        }}/>
                    }
                </IonItem>
            }

        </>
    }
}