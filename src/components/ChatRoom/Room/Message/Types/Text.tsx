import * as React from 'react';
import {Message, MessageStatus, MessageType, MsgText} from "../../../../../types";
import {IonAvatar, IonBadge, IonCheckbox, IonIcon, IonText} from "@ionic/react";
import {imageOutline, trashOutline} from "ionicons/icons";
import {utils} from "../../../../../common";
import {Role} from "./Role";
import 'react-photo-view/dist/react-photo-view.css';
import {ImageView} from "../../../../utils/ImageView";
import {Airdrop} from "./AirDrop";
import {useEffect, useLayoutEffect, useState} from "react";
import {Metadata, parser} from "html-metadata-parser";
import axios from "axios";
import config from "../../../../../common/config";
import {tribeService} from "../../../../../service/tribe";
import selfStorage from "../../../../../common/storage";

interface Props {
    msg: Message;
    showPin: boolean;
    owner: string;
    keeper?: string;
    checked?: boolean;
    hideTime?: boolean;
    onSupport?: (msgId: string, f: boolean) => void;
    hovered?:boolean

    showTag?: boolean;
}

export const Text: React.FC<Props> = ({
                                          msg, onSupport,hovered, keeper, hideTime, checked,
                                          showPin,
                                          owner,children, showTag,
                                      }) => {

    const content: MsgText = msg.content as MsgText;
    const isSystem = !msg.role;
    const replayCtn: MsgText = msg.replayMsg && (msg.replayMsg.content as MsgText);

    const isOwner = msg && owner == msg.owner && !msg.groupId
    const isOwnerPinned = msg && owner == msg.owner && !!msg.groupId
    const isSupported = msg && msg.Supporters && msg.Supporters.indexOf(owner) > -1;

    // console.log("replayCtn.content",replayCtn && replayCtn.content , msg && msg.replayMsg && msg.replayMsg.msgType)

    const support = msg.support > 0 && <div onClick={() => {
        if (onSupport) {
            onSupport(msg.id, true)
        }
    }}>
        <div className="support-display">
            <img src={isSupported ? './assets/img/support2.png' : './assets/img/support.png'} width={16}
                 height={16}/><small style={{
            fontWeight: 700
        }}>
            &nbsp;<IonText color={isSupported ? "primary" : ""}>{msg.support}</IonText></small>
        </div>
    </div>

    const [meta, setMeta] = useState(null);
    const [link, setLink] = useState("");


    useLayoutEffect(()=>{
        const content: MsgText = msg.content as MsgText;

        if(msg.owner == keeper && content.content){
            let urlIndex = -1 ;
            if(content.content && content.content.indexOf("https://")>-1){
                urlIndex = content.content.indexOf("https://");
            }else if(content.content && content.content.indexOf("http://")>-1){
                urlIndex = content.content.indexOf("http://");
            }
            if(urlIndex > -1){
                let _url = content.content.slice(urlIndex);
                if(_url.indexOf(" ") > -1){
                    _url = _url.slice(0, _url.indexOf(" "))
                }
                setLink(_url);
                const cache = tribeService.urlMetadata(_url);
                if(cache){
                    setMeta(cache)
                }
                axios.post(`${config.baseUrl}/verse/metadata/analyze`,{
                    url: _url
                }).then((result )=>{

                    const rest:Metadata = result.data;
                    // console.log(JSON.stringify(rest, null, 3));
                    selfStorage.setItem(`metadata_${_url}`, rest)

                    setMeta(rest)
                })
            }
        }

    }, [msg, keeper])

    const replayItem = replayCtn && msg.replayMsg && <div style={{
        minWidth: replayCtn && replayCtn.image && replayCtn.image.url ? "150px" : "50px",
        width: '100%',
        backgroundBlendMode: msg.role ? "multiply" : "screen"
    }} className={isOwner ?
        `${!msg.role ? 'replay-box replay-box-sender-norole-owner' : 'replay-box replay-box-sender'}`
        : `replay-box ${msg.role ? 'replay-box-receive' : 'replay-box-sender-norole'}`}>

        {
            msg.replayMsg.msgType == MessageType.Text ?
                <div style={{padding: '0 6px', width: '100%'}}>
                    <div style={{
                        paddingBottom: '3px',
                        minHeight: replayCtn && replayCtn.image && replayCtn.image.url ? '46px' : '20px'
                    }}>
                        <b>
                            <IonText color="dark">
                                {msg.replayMsg.actor ? msg.replayMsg.actor.name : "Narrator"}
                            </IonText>
                        </b>
                        {
                            replayCtn.image && replayCtn.image.url &&
                            <div><IonIcon color="dark" src={imageOutline}/></div>
                        }
                    </div>
                    {
                        replayCtn.content && <div className="text-pre" style={{
                            width: '85%',
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}>
                            {replayCtn.content}
                        </div>
                    }
                    {
                        replayCtn.image && replayCtn.image.url &&
                        <div style={{position: 'absolute', top: 0, right: 0, padding: 6}}>
                            <ImageView url={replayCtn.image.url} width={replayCtn.image.width}
                                       height={replayCtn.image.height} disH={45} disW={45}/>
                        </div>
                    }
                </div>
                :
                msg.replayMsg.msgType == MessageType.Role ?
                    <div style={{maxWidth: '300px',wordBreak: "break-all"}}>
                        <Role msg={msg.replayMsg} showPin={false}/>
                    </div> :
                    msg.replayMsg.msgType == MessageType.Airdrop &&
                    <div style={{maxWidth: '300px',wordBreak: "break-all"}}>
                        <Airdrop msg={msg.replayMsg} keeper={keeper} owner={owner}/>
                    </div>
        }
    </div>

    const genMetadataEl = () =>{

        return meta && <div className="og-card-box">
                {
                    (meta as Metadata).og.image && <div className="og-card-image"><img src={(meta as Metadata).og.image} style={{borderRadius: '12px 12px 0 0', verticalAlign: "middle"}}/></div>
                }
                <div style={msg.owner == owner && !msg.groupId ?{backgroundImage: "linear-gradient(var(--ion-color-secondary), var(--ion-color-secondary))"}:{}}>
                    {
                        !(meta as Metadata).og["title"] && <div>
                            <div className="og-card-title">{(meta as Metadata).meta.title}</div>
                            <div className="og-card-desc og-card-text">{(meta as Metadata).meta.description}</div>
                        </div>
                    }
                    {
                        (meta as Metadata).og.title && <div>
                            <div className="og-card-title">{(meta as Metadata).meta.title}</div>
                            <div className="og-card-title">{(meta as Metadata).og.title}</div>
                            <div className="og-card-desc og-card-text">{(meta as Metadata).og.description}</div>
                        </div>
                    }
                </div>
            </div>

    }

    const genContent = () =>{
        return <>
            {!link && content.content}
            {!!link  && <>
                {content.content.slice(0, content.content.indexOf(link))}
                <div className="text-pre-link" onClick={()=>window.open(link)}>&nbsp;&nbsp;&nbsp;&nbsp;<span className="tex-pre-link-text">{link}</span></div>
                {content.content.slice(content.content.indexOf(link) + link.length)}
            </>}
        </>
    }
    let contentText = content && content.content;

    const isMind = contentText && contentText.indexOf("💭") == 0;

    return <div style={{width: '100%'}} className={isSystem ? `box msg-no-role` : `box`}>

        {
            showPin && <div className="pin-check">
                <IonCheckbox name="pinMsgId" checked={checked} value={msg.id} disabled={msg && msg.msgType == MessageType.Airdrop}/>
            </div>
        }

        {
            (
                msg.msgType == MessageType.Text || msg.msgType == MessageType.Airdrop
            ) ?(
                msg && msg.role ?
                    <>
                        <div className={!hideTime ? "avatar" : ""} style={!!hideTime ?{width: 63}:{}}>
                            {
                                !hideTime && msg && msg.actor && !!msg.actor.avatar ?
                                    <IonAvatar className="ion-avatar">
                                        <img src={utils.getDisPlayUrl(msg.actor && msg.actor.avatar)} width={30}/>
                                    </IonAvatar> : <div style={{width: '48px'}}></div>
                            }
                        </div>
                        <div className="box-max-width">
                            {
                                <div style={{
                                    textAlign: isOwner ? "right" : "left",
                                    padding: "0px",
                                    width: "auto",
                                    height: !hideTime ? "auto" : 0,
                                    overflow: "hidden"
                                }}>
                                    <b style={{fontSize: '16px'}}>
                                        {keeper && <><IonText>{msg.actor && msg.actor.name}</IonText>&nbsp;{
                                            // msg.owner == keeper && !msg.groupId && <Keeper/>
                                        }</>}</b> <span style={{fontSize: '11px'}}><IonText
                                    color="medium">{utils.dateFormat(new Date(msg.timestamp * 1000))} </IonText></span>
                                </div>
                            }

                            {
                                <div
                                    className={isOwner ? `support-outer-owner ${hovered && 'support-outer-column'}` : `support-outer ${hovered && 'support-outer-column'}`}>
                                    <div className="sender-owner-xs">
                                        {
                                            msg && msg.msgType == MessageType.Text ?
                                                <>
                                                    {
                                                        content.content &&<div>
                                                            <div style={{
                                                                // width: '100%',
                                                                position: "relative",
                                                                border: isMind ? "1px dashed #000000" : (isOwnerPinned ? "1px solid #D8F20C" : "0"),
                                                                background: isMind ? "unset" : ""
                                                            }} className={isOwner ? "msg-text-sender" : "msg-text-receive"}>
                                                                {replayItem}
                                                                { genMetadataEl() }
                                                                <div style={{padding: '6px 6px 4px 6px'}}>
                                                                    <div className="text-pre">
                                                                        {genContent()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }


                                                    {
                                                        content.image && content.image.url && <div style={{
                                                            borderRadius: 12,
                                                            background: "inherit",
                                                            padding: 0,
                                                            textAlign: isOwner ? "right" : "left",
                                                            border: isOwnerPinned ? "1px solid #D8F20C" : "0"
                                                        }}
                                                                                                   className={owner != msg.owner ? "msg-text-receive" : ""}>
                                                            <ImageView url={content.image.url}
                                                                       width={content.image.width}
                                                                       height={content.image.height}/>
                                                        </div>
                                                    }
                                                </> : msg.msgType == MessageType.Airdrop && <>
                                                <Airdrop msg={msg} owner={owner} keeper={keeper}/>
                                            </>

                                        }
                                        {
                                            msg && showTag && !(msg.msgStatus == MessageStatus.draft || msg.msgStatus == MessageStatus.removed) &&
                                            <div className="removed">
                                                <img src="./assets/img/pined.png"/>
                                            </div>
                                        }
                                    </div>
                                    <div className="support-tool">
                                        {support}
                                        {children}
                                    </div>
                                </div>

                            }

                        </div>
                    </>
                    :
                    <div style={{width: '100%'}}>
                        {
                            !hideTime ? <div>
                                <span style={{fontSize: '11px'}}>
                                    {keeper && msg.owner == keeper && !msg.groupId &&
                                    <img src="/assets/img/keeper.png" height={14}
                                         style={{transform: 'translateY(1px)'}}/>} <IonText
                                    color="medium">{utils.dateFormat(new Date(msg.timestamp * 1000))}</IonText>
                                </span>
                            </div> : <div style={{height: "1px"}}></div>
                        }
                        <div className={`support-outer  ${hovered && 'support-outer-column'}`}>
                            <div className={isOwner ? 'no-role-div-owner' : "no-role-div"} style={{
                                position: "relative",
                                width: !onSupport ? "100%" : "",
                                background: content.image && content.image.url && !content.content &&
                                    "inherit", border: isOwnerPinned ? "1px solid #D8F20C" : "0"
                            }}>
                                {
                                    msg.msgType == MessageType.Airdrop ? <Airdrop msg={msg} owner={owner} keeper={keeper}/> : <>
                                        {
                                            content.image && content.image.url &&
                                            <div style={{borderRadius: 12, padding: '6px 6px 0px 6px'}}>
                                                <ImageView url={content.image.url} width={content.image.width}
                                                           height={content.image.height}/>
                                            </div>
                                        }
                                        {
                                            content.content && <div style={{padding: '5px'}}>
                                                {replayItem}
                                                { genMetadataEl() }
                                                <div style={{padding: '0 0 0 0px'}}>
                                                    <div className="text-pre">
                                                        {genContent()}
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </>
                                }

                                {
                                    msg && showTag && !(msg.msgStatus == MessageStatus.draft || msg.msgStatus == MessageStatus.removed) &&
                                    <div className="removed">
                                       <img src="./assets/img/pined.png"/>
                                    </div>
                                }
                            </div>
                            <div className="support-tool">
                                {support}
                                {children}
                            </div>
                        </div>
                    </div>
                )
                :

                <div>
                    <div className={`support-outer  ${hovered && 'support-outer-column'}`}>
                        <div style={{position: "relative"}}>
                            {
                                msg.msgType == MessageType.Role &&
                                <Role msg={msg} showPin={showPin} isOwner={msg && msg.owner == owner}/>
                            }
                            {
                                msg && showTag && !(msg.msgStatus == MessageStatus.draft || msg.msgStatus == MessageStatus.removed) &&
                                <div className="removed-role">
                                    <img src="./assets/img/pined.png"/>
                                </div>
                            }
                        </div>
                        <div className="support-tool">
                            {support}
                            {children}
                        </div>
                    </div>
                </div>
        }

    </div>
}