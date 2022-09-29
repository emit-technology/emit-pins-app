import * as React from 'react';
import {
    FacebookShareButton,
    FacebookIcon,
    TelegramIcon, TelegramShareButton,
    TwitterIcon, TwitterShareButton,
    LineShareButton,
    LineIcon,
    PinterestShareButton,
    PinterestIcon,
    RedditShareButton,
    RedditIcon,
    TumblrShareButton,
    TumblrIcon,
    ViberShareButton,
    ViberIcon,
    WeiboShareButton,
    WeiboIcon,
    WhatsappShareButton,
    WhatsappIcon,
    LinkedinShareButton,
    LinkedinIcon,
    VKShareButton,
    VKIcon,
    LivejournalShareButton,
    LivejournalIcon,
    WorkplaceShareButton,
    WorkplaceIcon,
    PocketShareButton,
    PocketIcon,
    InstapaperShareButton,
    InstapaperIcon,
    HatenaShareButton,
    HatenaIcon,
} from 'next-share';
import {
    IonButton, IonText,
    IonRow,
    IonCol,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle, IonLoading,
    IonToolbar, IonAvatar, IonIcon
} from "@ionic/react";
import {Message, MessageStatus, MessageType, TribeInfo, TribeRole} from "../../types";
// import config from "../../common/config";
// import {Helmet} from "react-helmet";
import {tribeService} from "../../service/tribe";
// import domtoimage from "dom-to-image-more";
import domtoimage from 'dom-to-image-improved';
import {Text} from "../ChatRoom/Room/Message/Types";
import {utils} from "../../common";
import selfStorage from "../../common/storage";
import {Tools} from "../ChatRoom/Room/Message/Types/Tools";
import {useEffect, useState} from "react";
import {shareOutline} from "ionicons/icons";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tribeInfo: TribeInfo;
    latestMsg: Array<Message>;
    roles: Array<TribeRole>;
    owner: string;
}

export const ShareEx: React.FC<Props> = ({isOpen, latestMsg, owner, roles, onClose, tribeInfo}) => {

    // const url = "https://abesc12.emit.technology/verse/4E4c8YEgUvE/22172ea7d796eedc959eb8b7dcfd5757";
    const [url, setUrl] = useState("");
    const hash = window.location.hash;
    const desc = `EMIT - PINs, ${tribeInfo && tribeInfo.title}, ${tribeInfo && tribeInfo.theme.themeTag}`;

    const [genning,setGenning] = useState(false);
    const [loading,setLoading] = useState(false);
    const [showButtons,setShowButtons] = useState(false);

    useEffect(() => {
        if (latestMsg && latestMsg.length > 0) {
            const element = document.getElementById("msg-bb-xbo");
            if (element) {
                element.scrollTop = element.scrollHeight;
            }
        }
    }, [latestMsg])
    const sharePng = () => {
        const domNode: any = document.getElementById("my-node");
        const scale = 2;
        const typs: any = {
            width: domNode.clientWidth * scale,
            height: domNode.clientHeight * scale,
            style: {
                transform: 'scale(' + scale + ')',
                transformOrigin: 'top left',
            }
        }
        setGenning(true)
        domtoimage.toBlob(domNode, typs, 0.99).then((blob) => {
            setGenning(false)
            setLoading(true)
            const file = new File([blob], `file.png`)
            tribeService.uploadFile(file).then(data => {
                setLoading(false)
                console.log(data);
                setUrl(`https://pins.emit.technology/verse/${tribeInfo.tribeId}/${data["filename"].replace(".png", "")}`)
                setShowButtons(true);
            }).catch(e => {
                console.error(e);
                setLoading(false)
            })
        });
    }

    const roleImgs: Array<string> = [];
    if (roles) {
        for (let i = 0; i < roles.length; i++) {
            if (i > 3 && roles.length > 4) {
                roleImgs.push(`${roles.length - 4}`)
                break;
            } else {
                roleImgs.push(utils.getDisPlayUrl(roles[i].avatar))
            }
        }
    }

    const renMessage = (v: Message, index: number) => {
        let className = 'msg-no-role-rxec';
        if (v.role) {
            className = owner == v.owner && !v.groupId ? "msg-sender" : "msg-receive"
        }
        return <div className={className} style={{
            justifyContent: v.msgType == MessageType.Role && "center",
            alignItems: v.msgType == MessageType.Role && "center"
        }} key={index}>
            <div className="inner" style={{maxWidth: '100%'}}>
                <Text keeper={tribeInfo && tribeInfo.keeper} msg={v} owner={owner} showPin={false}/>
            </div>
        </div>
    }

    return <>
        {/*<Helmet>*/}
        {/*    <meta property="twitter:card" content="summary_large_image"/>*/}
        {/*    <meta property="twitter:site" content="@emit_protocol"/>*/}
        {/*    <meta property="twitter:url"*/}
        {/*          content={`https://pins.emit.technology/${config.tribeId}?ref=twitter_summary_card`}/>*/}
        {/*    <meta property="twitter:title" content={desc}/>*/}
        {/*    <meta property="twitter:description" content={tribeInfo && tribeInfo.theme.themeDesc}/>*/}
        {/*    <meta property="twitter:image" content={tribeInfo && tribeInfo.theme.image["url"]}/>*/}

        {/*    <meta property="og:title" content={desc}/>*/}
        {/*    <meta property="og:site_name" content="EMIT - PINs"/>*/}
        {/*    <meta property="og:type" content="article"/>*/}
        {/*    <meta property="og:image" content={tribeInfo && tribeInfo.theme.image["url"]}/>*/}
        {/*    <meta property="og:description" content={`${desc} , ${tribeInfo && tribeInfo.theme.themeDesc}`}/>*/}
        {/*    <meta name="robots" content="max-image-preview:large"/>*/}
        {/*    <meta name="description" content={`${desc} , ${tribeInfo && tribeInfo.theme.themeDesc}`}/>*/}

        {/*</Helmet>*/}

        {/*//initialBreakpoint={0.4} breakpoints={[0, 0.4, 0.6]}*/}
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-share-modal">
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonButtons slot="end">
                        <IonButton onClick={() => sharePng()}><IonIcon src={shareOutline}/> Share</IonButton>
                    </IonButtons>
                    <IonTitle>Share {tribeInfo && tribeInfo.title}</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div id="my-node" className="share-node">
                    <div className="visual-msg-box share-page" style={{
                        height: '100%',
                        backgroundImage: `url(${tribeInfo && utils.getDisPlayUrl(tribeInfo.theme.image)})`
                    }}>
                        <div className="share-box">
                            <div className="share-left">
                                <div className="share-left-top">
                                    <div className="share-left-top-in">
                                        {
                                            roleImgs && roleImgs.length > 0 && roleImgs.map((img, i) => {
                                                if (i >= 4) {
                                                    return <div key={i} className="pinned-msg-roles pinned-msg-rolesi">
                                                        +{roleImgs[i]}
                                                    </div>
                                                }
                                                return <div key={i} className="pinned-msg-roles"
                                                            style={{right: 20 + (i + 1) * 22, zIndex: 10000 - i * 2}}>
                                                    <IonAvatar className="ion-avatar2">
                                                        <img src={img}/>
                                                    </IonAvatar>
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="share-left-bottom">
                                    <div className="share-left-bottom-info-box">
                                        <div className="share-left-bottom-info">
                                            <img src={utils.getDisPlayUrl(tribeInfo && tribeInfo.theme.image)}
                                                 width="100%"
                                                 height="100%" style={{borderRadius: '8px'}}/>
                                        </div>
                                        <div>
                                            <div className="head-pin-title" style={{fontFamily:'SFBold',fontSize:'24px'}}>{tribeInfo && tribeInfo.title}</div>
                                            <div className="share-ic-itext">{tribeInfo && tribeInfo.theme.themeTag}{tribeInfo && tribeInfo.theme.themeTag}{tribeInfo && tribeInfo.theme.themeTag}</div>
                                        </div>
                                    </div>
                                    <div style={{width: '58px'}}>
                                        <img src="./assets/img/pins-logo.png"/>
                                    </div>
                                </div>
                            </div>
                            <div className="share-right">
                                <div className="share-right-msg-box"
                                     style={{backgroundImage: `url(${tribeInfo && utils.getDisPlayUrl(tribeInfo.theme.image)})`}}>
                                    <div className="share-right-msg" id="msg-bb-xbo">
                                        {
                                            latestMsg && latestMsg.map((v, i) => {
                                                return renMessage(v, i)
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <IonLoading
                    isOpen={loading}
                    onDidDismiss={() => setLoading(false)}
                    message={'Loading...'}
                    duration={50000}
                />

                <IonLoading
                    isOpen={genning}
                    onDidDismiss={() => setGenning(false)}
                    message={'Please wait...'}
                    duration={50000}
                />

            </IonContent>
        </IonModal>


        <IonModal isOpen={showButtons} initialBreakpoint={0.4} breakpoints={[0, 0.4, 0.6]} onDidDismiss={() => setShowButtons(false)}>
            <IonContent className="ion-padding">
                <div  className="share-tbs">
                    <div>
                        <IonRow style={{textAlign: 'center'}}>
                            <IonCol size={"2"}>
                                <FacebookShareButton
                                    url={url}
                                    quote={desc}
                                    hashtag={`#${hash}`}
                                >
                                    <FacebookIcon size={48} round/>
                                </FacebookShareButton>
                            </IonCol>

                            <IonCol size={"2"}>
                                <TwitterShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <TwitterIcon size={48} round/>
                                </TwitterShareButton>
                            </IonCol>
                            <IonCol size="2">
                                <TelegramShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <TelegramIcon size={48} round/>
                                </TelegramShareButton>
                            </IonCol>

                            <IonCol size="2">
                                <ViberShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <ViberIcon size={48} round/>
                                </ViberShareButton>
                            </IonCol>
                            <IonCol size="2">
                                <WeiboShareButton
                                    url={url}
                                    title={desc}
                                    image={'./assets/icon/icon.png'}
                                >
                                    <WeiboIcon size={48} round/>
                                </WeiboShareButton>
                            </IonCol>
                            <IonCol size="2">
                                <WhatsappShareButton
                                    url={url}
                                    title={desc}
                                    separator=":: "
                                >
                                    <WhatsappIcon size={48} round/>
                                </WhatsappShareButton>
                            </IonCol>


                            <IonCol size="2">
                                <LinkedinShareButton url={url}>
                                    <LinkedinIcon size={48} round/>
                                </LinkedinShareButton>
                            </IonCol>
                            <IonCol size="2">
                                <VKShareButton
                                    url={url}
                                    image={'./assets/icon/icon.png'}
                                >
                                    <VKIcon size={48} round/>
                                </VKShareButton>
                            </IonCol>
                            <IonCol size="2">
                                <WorkplaceShareButton
                                    url={url}
                                    quote={desc}
                                >
                                    <WorkplaceIcon size={48} round/>
                                </WorkplaceShareButton>
                            </IonCol>


                            <IonCol size="2">
                                <PocketShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <PocketIcon size={48} round/>
                                </PocketShareButton>
                            </IonCol>
                            <IonCol size="2">
                                <InstapaperShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <InstapaperIcon size={48} round/>
                                </InstapaperShareButton>
                            </IonCol>
                            <IonCol size="2">
                                <HatenaShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <HatenaIcon size={48} round/>
                                </HatenaShareButton>
                            </IonCol>

                            <IonCol size="2">
                                <LineShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <LineIcon size={48} round/>
                                </LineShareButton>
                            </IonCol>

                            <IonCol size="2">
                                <PinterestShareButton
                                    url={url}
                                    media={desc}
                                >
                                    <PinterestIcon size={48} round/>
                                </PinterestShareButton>
                            </IonCol>

                            <IonCol size="2">
                                <RedditShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <RedditIcon size={48} round/>
                                </RedditShareButton>
                            </IonCol>

                            <IonCol size="2">
                                <TumblrShareButton
                                    url={url}
                                    title={desc}
                                >
                                    <TumblrIcon size={48} round/>
                                </TumblrShareButton>
                            </IonCol>

                            <IonCol size="2">
                                <LivejournalShareButton
                                    url={url}
                                    title={"EMIT - PINS"}
                                    description={desc}
                                >
                                    <LivejournalIcon size={48} round/>
                                </LivejournalShareButton>
                            </IonCol>
                        </IonRow>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    </>
}