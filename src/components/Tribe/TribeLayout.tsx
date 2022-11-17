import * as React from 'react';
import {MessageType, MsgText, TribeInfo, TribeRole} from "../../types";
import {utils} from "../../common";
import {XBlock, XMasonry} from "react-xmasonry";
import config from "../../common/config";
import {Airdrop} from "../ChatRoom/Room/Message/Types";
import {IonIcon} from "@ionic/react";
import {gitBranchOutline, gitBranchSharp} from "ionicons/icons";
import selfStorage from "../../common/storage";

interface Props {
    data: Array<TribeInfo>
    tribeTimeMap: Map<string,number>
}

export const TribeLayout: React.FC<Props> = ({data,tribeTimeMap}) => {


    return <>

        <XMasonry>
            {
                data && data.map((v, i) => {
                    const content = v.latestMsg && v.latestMsg.content as MsgText;
                    let roles = v.roles;
                    if(!roles){
                        roles = []
                    }
                    const actor: TribeRole = roles.find(vr => vr.id == (v.latestMsg && v.latestMsg.role));

                    return <XBlock key={i}>
                        <div className="recmt-content card" onClick={() => {
                            selfStorage.setItem(`latest_view_${v.tribeId}`,Math.floor(Date.now()/1000));
                            utils.goTo(v.tribeId)
                        }}>
                            <div className="recmt-head">
                                <div className="recmt-head-icon">
                                    <img src={utils.getDisPlayUrl(v.theme.image)}/>
                                </div>
                                <div className="recmt-head-title">
                                    <div style={{padding: "0px 0 3px 0",position: "relative"}}>{v.title} {
                                        v.tribeId == config.defaultTribes &&
                                        <div className="cert-icon"><img src="./assets/img/cert.png" className="cert-icon" width="100%" height="100%"/></div>
                                     }
                                        {
                                            v.forked && v.forked.length>0 && <IonIcon src={gitBranchSharp} color="primary"/>
                                        }
                                    </div>
                                    {/*<div>{v.theme.themeTag}</div>*/}
                                    <div>{v.tribeId}</div>
                                </div>
                            </div>
                            <div className="airdrop-time">{v.latestMsg && v.latestMsg.timestamp && utils.dateFormat(new Date(v.latestMsg.timestamp*1000))}</div>
                            {
                                content && content["image"] && content["image"]["url"] &&
                                <div className="recmt-img">
                                    <img src={content["image"]["url"]}/>
                                </div>
                            }
                            {
                                content && content["content"] &&
                                <div className="recmt-context">
                                    { v.latestMsg && v.latestMsg.msgType == MessageType.Text?content["content"]:
                                        v.latestMsg && v.latestMsg.msgType == MessageType.Airdrop && <>
                                            <div className="box" style={{
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                width: "100%"
                                            }}>
                                                <div style={{width: "100%"}}>
                                                    <div className="airdrop-cnt">
                                                        <div className="airdrop-png2" style={{backgroundImage:'url("./assets/img/airdrop-bg.png")'}}>
                                                            <div className="airdrop-ctx">
                                                                <div style={{fontSize: '10px',opacity: 0.75,color:"#fff"}}><small>AIRDROP</small></div>
                                                                <div>{content["title"]}</div>
                                                                <div style={{position: "relative",fontSize:'24px',color:"var(--ion-color-secondary)"}}>
                                                                    {utils.fromValue(content["factor"]["value"],18).toFixed(3)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="symbol-cat">
                                                            {content["factor"]["category"]["symbol"]}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    }
                                    <div className="sflwf">
                                        <img src="./assets/img/talk.png" height={20}/>
                                    </div>
                                </div>
                            }

                            <div className="recmt-footer">
                                <div>
                                    {roles && roles.length + 1} Roles
                                </div>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    {actor ? <>
                                        <div style={{
                                            padding: '0 6px',
                                            color: "#000",
                                            fontSize: '16px'
                                        }}>
                                            <>{actor.name}</>
                                        </div>
                                        <div>
                                            <img src={utils.getDisPlayUrl(actor.avatar)}/>
                                        </div>
                                    </>:<>
                                        <div style={{
                                            padding: '0 6px',
                                            color: "#000",
                                            fontSize: '16px'
                                        }}>
                                            <>Narrator</>
                                        </div>
                                        <div>
                                            <img src={"./assets/img/default-avatar.png"}/>
                                        </div>
                                    </>
                                    }
                                </div>
                            </div>

                            {
                                tribeTimeMap && (tribeTimeMap.has(v.tribeId) && tribeTimeMap.get(v.tribeId) < v.latestMsg.timestamp || !tribeTimeMap.has(v.tribeId)) && <>
                                    <div className="tag-point"></div>
                                    </>
                            }
                        </div>
                    </XBlock>
                })
            }
        </XMasonry>


    </>
}