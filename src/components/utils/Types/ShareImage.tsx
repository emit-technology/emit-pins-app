import * as React from 'react';
import {Message, MsgText, MsgTextImage} from "../../../types";
import {utils} from "../../../common";
import {ImageView} from "../ImageView";

interface Props {
    msg: Message
}

export const ShareImage: React.FC<Props> = ({msg}) => {

    const content: MsgText = msg.content as MsgText;
    return <>
        <div className="share-content-image">
            {
                content.image && content.image.url && <div className="share-content-v2-img">
                        <img src={utils.getDisPlayUrl(content.image)} style={{ borderRadius: 12,objectFit: "cover", width:"125px", height: "125px", verticalAlign: "middle"}}/>

                    {
                        msg.role && <div style={{    position: "absolute", top: 6, left:6}}>
                            <img src={utils.getDisPlayUrl(msg.actor.avatar)} style={{borderRadius: "50%", width: 36, height: 36, objectFit: "cover"}}/>
                        </div>
                    }
                </div>
            }

            {
                content.content && <div className="share-content-image-text" >
                        <div style={{color: "#A7A7A7"}}>{msg.actor.name}</div>
                        <div className="text-pre" style={{color: "#000"}}>{content.content}</div>
                </div>
            }

        </div>
    </>
}