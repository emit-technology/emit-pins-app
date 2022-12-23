import * as React from 'react';
import {AirdropContent, AirdropInfo, Message, MsgText} from "../../../types";
import {utils} from "../../../common";

interface Props{
    msg: Message
}

export const ShareAirdrop: React.FC<Props> = ({msg}) =>{
    const content: AirdropContent = msg.content as AirdropContent;
    return <>
        <div className="share-content-airdrop">
            <div style={{display: "flex"}}>
                <div className="airdrop-cnt" style={{
                    borderRadius: '45px',
                    overflow: 'hidden'
                }}>
                    <div className="airdrop-png" style={{backgroundImage:'url("./assets/img/airdrop-bg.png")'}}>
                        <div className="airdrop-ctx">
                            <div style={{fontSize: '10px',opacity: 0.75,color:"#fff"}}><small>AIRDROP</small></div>
                            <div className="airdrop-amount">
                                {utils.fromValue(content.factor.value,18).toString()}
                            </div>
                            <div className="airdrop-title">{content.title}</div>
                        </div>
                    </div>

                    <div className="symbol-cat2">
                        {content.factor.category.symbol}
                    </div>
                </div>
            </div>
        </div>
    </>
}