import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    FacebookIcon,
    FacebookShareButton,
    HatenaIcon,
    HatenaShareButton,
    InstapaperIcon,
    InstapaperShareButton,
    LineIcon,
    LineShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    LivejournalIcon,
    LivejournalShareButton,
    PinterestIcon,
    PinterestShareButton,
    PocketIcon,
    PocketShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    TumblrIcon,
    TumblrShareButton,
    TwitterIcon,
    TwitterShareButton,
    ViberIcon,
    ViberShareButton,
    VKIcon,
    VKShareButton,
    WeiboIcon,
    WeiboShareButton,
    WhatsappIcon,
    WhatsappShareButton,
    WorkplaceIcon,
    WorkplaceShareButton,
} from 'next-share';
import {
    IonAvatar,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonIcon,
    IonLoading,
    IonModal,
    IonRow,
    IonTitle,
    IonToolbar,
    useIonToast
} from "@ionic/react";
import {Message, MessageType, MsgText, PinnedSticky, TribeInfo, TribeRole} from "../../types";
import {tribeService} from "../../service/tribe";
// import domtoimage from "dom-to-image-more";
import domtoimage from 'dom-to-image-improved';
import {Text} from "../ChatRoom/Room/Message/Types";
import {utils} from "../../common";
import selfStorage from "../../common/storage";
import {copyOutline, shareOutline} from "ionicons/icons";
import copy from "copy-to-clipboard";
import config from "../../common/config";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tribeInfo: TribeInfo;
    latestMsg: Array<Message>;
    roles: Array<TribeRole>;
    owner: string;
    showHistory?:boolean
    stickyMsg?: PinnedSticky
}

export const ShareEx: React.FC<Props> = ({isOpen,showHistory,stickyMsg, latestMsg, owner, roles, onClose, tribeInfo}) => {

    // const url = "https://abesc12.emit.technology/verse/4E4c8YEgUvE/22172ea7d796eedc959eb8b7dcfd5757";
    const [url, setUrl] = useState("");
    const [present, dismiss] = useIonToast();
    const hash = window.location.hash;
    const desc = `EMIT - PINs, ${tribeInfo && tribeInfo.title}, ${tribeInfo && tribeInfo.theme.themeTag}`;

    const [genning, setGenning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    const [messages,setMessages] = useState([]);
    const [roleImgs,setRoleImgs] = useState([]);
    const [themeImage,setThemeImage] = useState("");
    const [backImage,setBackImage] = useState("");
    const [logo, setLogo] = useState("")

    useEffect(()=>{
            if(!!isOpen){
                setGenning(true)
                init().then(()=>{
                    setGenning(false)
                }).catch(e=>{
                    setGenning(false)
                    console.error(e)
                })
            }
    },[isOpen,latestMsg])

    const init = async ()=>{
        {
            const msgs:Array<Message> = [];
            for (let m of latestMsg){
                const msg = await utils.convertMsgImage(m);
                msgs.push(msg)
            }
            setMessages(msgs);
        }

        {
            const roleImgs: Array<string> = [];
            if (roles) {
                for (let i = 0; i < roles.length; i++) {
                    if (i > 3 && roles.length > 4) {
                        roleImgs.push(`${roles.length - 4}`)
                        break;
                    } else {
                        if(utils.useBase64Img()){
                            const img = await utils.toLocalImageUrl(roles[i].avatar["url"])
                            roleImgs.push(img)
                        }else{
                            roleImgs.push(utils.getDisPlayUrl(roles[i].avatar))
                        }
                    }
                }
            }
            setRoleImgs(roleImgs)
        }

        {
            if(utils.useBase64Img()){
                const timg = await utils.toLocalImageUrl(tribeInfo && tribeInfo.theme.image["url"]);
                setThemeImage(timg)
            }else{
                setThemeImage(utils.getDisPlayUrl(tribeInfo && tribeInfo.theme.image))
            }
        }

        {
            if(utils.useBase64Img()){
                if(!!stickyMsg){
                    const bg = await utils.toLocalImageUrl(stickyMsg.theme.image["url"]);
                    setBackImage(`url(${bg})`);
                }else{
                    if(!!tribeInfo){
                        const bg = await utils.toLocalImageUrl(tribeInfo.theme.image["url"])
                        setBackImage(`url(${bg})`);
                    }
                }
            }else{
                const backImg = `url(${stickyMsg? utils.getDisPlayUrl(stickyMsg.theme.image):tribeInfo && utils.getDisPlayUrl(tribeInfo.theme.image)})`;
                setBackImage(backImg);
            }
        }

        {
            const lgo = await utils.toLocalImageUrl('./assets/img/pins-logo.png')
            setLogo(lgo)
        }

    }

    const getLastImageId = ()=>{
        if(!latestMsg || latestMsg.length ==0){
            return ""
        }
        if(showHistory){
            return selfStorage.getItem(`lastShareImgId_${latestMsg[0].id}`)
        }else{
            return selfStorage.getItem(`lastShareImgId_${latestMsg[latestMsg.length-1].id}`)
        }
    }

    const getStartMsgId = ()=>{
        if(!latestMsg || latestMsg.length ==0){
            return ""
        }
        if(showHistory){
            return latestMsg[0].id;
        }else{
            return latestMsg[latestMsg.length-1].id
        }
    }

    const setLastImageId = (shareImageId:string)=>{
        if(!latestMsg || latestMsg.length ==0){
            return
        }
        if(showHistory){
            selfStorage.setItem(`lastShareImgId_${latestMsg[0].id}`,shareImageId)
        }else{
            selfStorage.setItem(`lastShareImgId_${latestMsg[latestMsg.length-1].id}`,shareImageId)
        }
    }

    const sharePng = async () => {
        const lastShareImgId = getLastImageId();
        if(!lastShareImgId){
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
                    const shareImageId = data["filename"].replace(".png", "");
                    setUrl(`${config.baseUrl}/verse/${tribeInfo.tribeId}/${shareImageId}/${getStartMsgId()}`)
                    setLastImageId(shareImageId)
                    setShowButtons(true);
                }).catch(e => {
                    console.error(e);
                    setLoading(false)
                })
            });
        }else{
            setUrl(`${config.baseUrl}/verse/${tribeInfo.tribeId}/${lastShareImgId}/${getStartMsgId()}`)
            setShowButtons(true);
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

    let androidStyle= {};
    if(utils.isAndroid()){
        androidStyle = {maxHeight: '100%'}
    }

    return <>
        {/*//initialBreakpoint={0.4} breakpoints={[0, 0.4, 0.6]}*/}
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="tribe-share-modal">
            <IonToolbar>
                <IonButtons slot="end">
                    <IonButton disabled={genning} onClick={() => sharePng().catch(e=>console.error(e))}><IonIcon src={shareOutline}/> Share</IonButton>
                </IonButtons>
                <IonTitle>Share {tribeInfo && tribeInfo.title}</IonTitle>
                <IonButtons slot="start">
                    <IonButton onClick={() => onClose()}>Close</IonButton>
                </IonButtons>
            </IonToolbar>
            <IonContent className="ion-padding">
                <div id="my-node" className="share-node">
                    <div className="visual-msg-box share-page" style={{
                        height: '100%',
                        backgroundImage: backImage
                    }}>
                        <div className="share-box">
                            <div className="share-left">
                                <div className="share-left-top">
                                    <div className="share-left-top-in">
                                        {
                                            roleImgs && roleImgs.length > 0 && roleImgs.map((img, i) => {
                                                if (i >= 4) {
                                                    return <div key={i}
                                                                className="pinned-msg-roles pinned-msg-rolesi">
                                                        +{roleImgs[i]}
                                                    </div>
                                                }
                                                return <div key={i} className="pinned-msg-roles"
                                                            style={{
                                                                right: 20 + (i + 1) * 22,
                                                                zIndex: 10000 - i * 2
                                                            }}>
                                                    <IonAvatar className="ion-avatar2">
                                                        <img src={img} width="100%" height="100%" />
                                                    </IonAvatar>
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="share-left-bottom">
                                    <div className="share-left-bottom-info-box">
                                        <div>
                                            <div className="share-left-bottom-info">
                                                <img src={themeImage}
                                                     width="100%"
                                                     height="100%" style={{borderRadius: '8px',objectFit:"cover"}}  />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{
                                                fontFamily: 'SFBold',
                                                fontSize: '24px'
                                            }}>{tribeInfo && tribeInfo.title}</div>
                                            <div
                                                className="share-ic-itext">{tribeInfo && tribeInfo.theme.themeTag}</div>
                                        </div>
                                    </div>
                                    <div style={{width: '58px'}}>
                                        {/*// `${config.baseUrl}/pic/display?url=https://pic.emit.technology/img/596b38a47d086a32a5804ea7a4da9868.png&w=299&h=119&op=resize&upscale=1`*/}
                                        <img src={ logo } width="100%"/>
                                    </div>
                                </div>
                            </div>
                            <div className="share-right">
                                <div className="share-right-msg-box"
                                     style={{backgroundImage: backImage}}>
                                    <div className="share-right-msg" id="msg-bb-xbo" style={androidStyle}>
                                        <div className="share-right-msg-inner" style={{justifyContent: showHistory?"flex-start" : "flex-end"}}>
                                            {
                                                messages && messages.map((v, i) => {
                                                    return renMessage(v, i)
                                                })
                                            }
                                        </div>
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


        <IonModal isOpen={showButtons} initialBreakpoint={0.4} breakpoints={[0, 0.4, 0.6]}
                  onDidDismiss={() => setShowButtons(false)}>
            <IonContent className="ion-padding">
                <div className="share-tbs">
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
                        <IonRow>
                            <IonCol size="8">
                                <div className="link-url">
                                    {url}
                                </div>
                            </IonCol>
                            <IonCol size="4">
                                <IonButton expand="block" fill="outline" color="dark" onClick={() => {
                                    copy(url)
                                    copy(url)
                                    present({message: "Copied to clipboard!", color: "primary", duration: 2000})
                                }}>
                                    <IonIcon src={copyOutline} size="large" slot="start"/> Copy Link
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    </>
}