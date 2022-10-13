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
                    <div style={{maxWidth: '300px'}}>
                        <div className="airdrop-cnt">
                            <div style={{
                                position: "relative", minWidth: '200px',
                                border: isOwner ? "1px solid #D8F20C" : "0",
                                background: 'var(--ion-color-tertiary)',
                                padding: '6px 12px',
                                borderRadius: 12,
                                overflow: "hidden",
                            }}>
                                <div style={{
                                    display: "flex",
                                    borderRadius: 12,
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <div>
                                            <IonAvatar slot="start" className="ion-avatar2">
                                                <IonIcon src={rocketOutline} size="large"/>
                                            </IonAvatar>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: "0 0 0 6px", display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <div><b>{content.title}</b></div>
                                        <div style={{position: "relative"}}>
                                            <IonBadge>{utils.fromValue(content.factor.value,18).toFixed(3)}</IonBadge>
                                            <IonBadge color="secondary">{content.factor.category.symbol}</IonBadge>
                                            {/*<FactorItem factor={content.factor} noTransform={true} showLine={false}/>*/}
                                        </div>
                                    </div>
                                </div>
                                <div className="airdrop-content-text"><IonText color="medium">{content.content}</IonText></div>
                            </div>

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
        <AirdropInfoModal onClose={()=>setShowInfo(false)} isOpen={showInfo} msg={msg} airdropRecord={airdropRecord}/>
    </>
}