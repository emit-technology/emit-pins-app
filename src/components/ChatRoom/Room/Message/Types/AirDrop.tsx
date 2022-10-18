import * as React from 'react';
import {AirdropContent, Message} from "../../../../../types";
import {IonAvatar, IonIcon,IonBadge, IonText,IonLoading} from "@ionic/react";
import {utils} from "../../../../../common";
import {PhotoProvider, PhotoView} from "react-photo-view";
import {rocketOutline} from "ionicons/icons";
import {FactorItem} from "../../../../Assets";
import {useState} from "react";
import {AirdropInfoModal} from "./AirdropInfoModal";
import {tribeService} from "../../../../../service/tribe";

interface Props {
    msg: Message
    isOwner?: boolean
}

export const Airdrop: React.FC<Props> = ({msg, isOwner}) => {
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
                                <div>{content.title}</div>
                                <div style={{position: "relative",fontSize:'24px',color:"var(--ion-color-secondary)"}}>
                                    {utils.fromValue(content.factor.value,18).toFixed(3)}
                                </div>
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
        <AirdropInfoModal onClose={()=>setShowInfo(false)} owner={isOwner &&  msg.owner} isOpen={showInfo} msg={msg} airdropRecord={airdropRecord}/>
    </>
}