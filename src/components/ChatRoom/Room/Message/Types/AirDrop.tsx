import * as React from 'react';
import {AirdropContent, Message} from "../../../../../types";
import {IonLoading} from "@ionic/react";
import {utils} from "../../../../../common";
import {useState} from "react";
import {AirdropInfoModal} from "./AirdropInfoModal";
import {tribeService} from "../../../../../service/tribe";

interface Props {
    msg: Message
    owner: string
    keeper: string;
}

export const Airdrop: React.FC<Props> = ({msg,keeper, owner}) => {
    const content: AirdropContent = msg.content as AirdropContent;

    const [showInfo,setShowInfo] = useState(false);

    const [showLoading, setShowLoading] = useState(false);

    const [airdropRecord, setAirdropRecord] = useState([])

    const init = async ()=>{
        const rest = await tribeService.airdropRecords(msg.id);
        setAirdropRecord(rest);
        setShowInfo(true)
    }
    return <>
        <div className="msg-receive2" key={msg.id} onClick={()=>{
            setShowLoading(true)
            init().then(()=>{
                setShowLoading(false)
            }).catch(e=>{
                setShowLoading(false)
                console.error(e)
            })
        }}>
            <div className="box" style={{
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <div style={{display: "flex"}}>
                    <div className="airdrop-cnt">
                        <div className="airdrop-png" style={{backgroundImage:'url("./assets/img/airdrop-bg.png")'}}>
                            <div className="airdrop-ctx">
                                <div style={{fontSize: '10px',opacity: 0.75,color:"#fff"}}><small>AIRDROP</small></div>
                                <div className="airdrop-amount">
                                    {utils.fromValue(content.factor.value,18).toString()}
                                </div>
                                <div className="airdrop-title">{content.title}</div>
                            </div>
                        </div>

                        <div className="symbol-cat">
                            {content.factor.category.symbol}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <IonLoading
            cssClass='my-custom-class'
            isOpen={showLoading}
            onDidDismiss={() => setShowLoading(false)}
            message={'Please wait...'}
            duration={50000}
        />
        <AirdropInfoModal keeper={keeper} onClose={()=>setShowInfo(false)} owner={owner} isOpen={showInfo} msg={msg} airdropRecord={airdropRecord}/>
    </>
}