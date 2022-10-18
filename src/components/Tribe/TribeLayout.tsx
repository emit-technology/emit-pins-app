import * as React from 'react';
import {MsgText, TribeInfo, TribeRole} from "../../types";
import {utils} from "../../common";
import { XMasonry, XBlock } from "react-xmasonry";
import selfStorage from "../../common/storage";
import config from "../../common/config";

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
                            window.location.href = `./${v.tribeId}`
                        }}>
                            <div className="recmt-head">
                                <div className="recmt-head-icon">
                                    <img src={utils.getDisPlayUrl(v.theme.image)}/>
                                </div>
                                <div className="recmt-head-title">
                                    <div style={{padding: "0px 0 3px 0",position: "relative"}}>{v.title} {
                                        v.tribeId == config.defaultTribes &&
                                        <div className="cert-icon"><img src="./assets/img/cert.png" className="cert-icon" width="100%" height="100%"/></div>
                                    }</div>
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
                                    {content["content"]}
                                    <div >
                                        <img src="./assets/img/talk.png"/>
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
                                tribeTimeMap && tribeTimeMap.has(v.tribeId) && tribeTimeMap.get(v.tribeId) < v.latestMsg.timestamp && <>
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