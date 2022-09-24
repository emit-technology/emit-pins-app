import * as React from 'react';
import {Message, MsgText} from "../../../../../types";
import {utils} from "../../../../../common";

interface Props{
    msg: Message
}

export const Theme:React.FC<Props> = ({msg}) =>{

    return <>
        <img src={utils.getDisPlayUrl(msg.theme && msg.theme.image)} width="100%" style={{height: 200, objectFit: 'cover'}}/>
        {/*<div style={{width: "100%",padding: 12,borderRadius: "0 0 10px 10px",backgroundColor: "#fff"}}>*/}
        {/*    {msg && (msg.content as MsgText).content}*/}
        {/*</div>*/}
    </>
}