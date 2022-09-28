import * as React from 'react';
import {
    FacebookShareButton,
    FacebookIcon,
    TelegramIcon,TelegramShareButton,
    TwitterIcon,TwitterShareButton,
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
import {IonButton, IonRow,IonCol,IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import {TribeInfo} from "../../types";
import config from "../../common/config";
import {Helmet} from "react-helmet";

interface Props{
    isOpen: boolean;
    onClose:()=>void;
    tribeInfo: TribeInfo;
}

export const ShareEx :React.FC<Props> = ({isOpen,onClose, tribeInfo})=>{

    const url = window.location.href;
    const hash = window.location.hash;
    const desc =`EMIT - PINS, ${tribeInfo && tribeInfo.title}, ${tribeInfo && tribeInfo.theme.themeTag}`;

    return <>
        <Helmet>
            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:site" content="@emit_protocol"/>
            <meta property="twitter:url"
                  content={`https://pins.emit.technology/${config.tribeId}?ref=twitter_summary_card`}/>
            <meta property="twitter:title" content={tribeInfo && tribeInfo.title}/>
            <meta property="twitter:description" content={tribeInfo && tribeInfo.theme.themeDesc}/>
            <meta property="twitter:image" content={tribeInfo && tribeInfo.theme.image["url"]}/>

            <meta property="og:title" content={tribeInfo && tribeInfo.title}/>
            <meta property="og:site_name" content={tribeInfo && tribeInfo.title}/>
            <meta property="og:type" content="article"/>
            <meta property="og:image" content={tribeInfo && tribeInfo.theme.image["url"]}/>
            <meta property="og:description" content={tribeInfo && tribeInfo.theme.themeDesc}/>
            <meta name="robots" content="max-image-preview:large"/>
            <meta name="description" content={tribeInfo && tribeInfo.theme.themeDesc}/>

        </Helmet>

        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} initialBreakpoint={0.4} breakpoints={[0, 0.4, 0.6]} className="tribe-edit-modal">
        <IonHeader collapse="fade">
            <IonToolbar>
                <IonTitle>Share {tribeInfo && tribeInfo.title}</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={() => onClose()}>Close</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
            <IonRow style={{textAlign: 'center'}}>
                <IonCol size={"2"}>
                    <FacebookShareButton
                        url={url}
                        quote={desc}
                        hashtag={`#${hash}`}
                    >
                        <FacebookIcon size={48} round />
                    </FacebookShareButton>
                </IonCol>
                <IonCol size={"2"}>
                    <TwitterShareButton
                        url={url}
                        title={desc}
                    >
                        <TwitterIcon size={48} round />
                    </TwitterShareButton>
                </IonCol>
                <IonCol size="2">
                    <TelegramShareButton
                        url={url}
                        title={desc}
                    >
                        <TelegramIcon size={48} round />
                    </TelegramShareButton>
                </IonCol>

                <IonCol size="2">
                    <ViberShareButton
                        url={url}
                        title={desc}
                    >
                        <ViberIcon size={48} round />
                    </ViberShareButton>
                </IonCol>
                <IonCol size="2">
                    <WeiboShareButton
                        url={url}
                        title={desc}
                        image={'./assets/icon/icon.png'}
                    >
                        <WeiboIcon size={48} round />
                    </WeiboShareButton>
                </IonCol>
                <IonCol size="2">
                    <WhatsappShareButton
                        url={url}
                        title={desc}
                        separator=":: "
                    >
                        <WhatsappIcon size={48} round />
                    </WhatsappShareButton>
                </IonCol>


                <IonCol size="2">
                    <LinkedinShareButton url={url}>
                        <LinkedinIcon size={48} round />
                    </LinkedinShareButton>
                </IonCol>
                <IonCol size="2">
                    <VKShareButton
                        url={url}
                        image={'./assets/icon/icon.png'}
                    >
                        <VKIcon size={48} round />
                    </VKShareButton>
                </IonCol>
                <IonCol size="2">
                    <WorkplaceShareButton
                        url={url}
                        quote={desc}
                    >
                        <WorkplaceIcon size={48} round />
                    </WorkplaceShareButton>
                </IonCol>


                <IonCol size="2">
                    <PocketShareButton
                        url={url}
                        title={desc}
                    >
                        <PocketIcon size={48} round />
                    </PocketShareButton>
                </IonCol>
                <IonCol size="2">
                    <InstapaperShareButton
                        url={url}
                        title={desc}
                    >
                        <InstapaperIcon size={48} round />
                    </InstapaperShareButton>
                </IonCol>
                <IonCol size="2">
                    <HatenaShareButton
                        url={url}
                        title={desc}
                    >
                        <HatenaIcon size={48} round />
                    </HatenaShareButton>
                </IonCol>

                <IonCol size="2">
                    <LineShareButton
                        url={url}
                        title={desc}
                    >
                        <LineIcon size={48} round />
                    </LineShareButton>
                </IonCol>

                <IonCol size="2">
                    <PinterestShareButton
                        url={url}
                        media={desc}
                    >
                        <PinterestIcon size={48} round />
                    </PinterestShareButton>
                </IonCol>

                <IonCol size="2">
                    <RedditShareButton
                        url={url}
                        title={desc}
                    >
                        <RedditIcon size={48} round />
                    </RedditShareButton>
                </IonCol>

                <IonCol size="2">
                    <TumblrShareButton
                        url={url}
                        title={desc}
                    >
                        <TumblrIcon size={48} round />
                    </TumblrShareButton>
                </IonCol>

                <IonCol size="2">
                    <LivejournalShareButton
                        url={url}
                        title={"EMIT - PINS"}
                        description={desc}
                    >
                        <LivejournalIcon size={48} round />
                    </LivejournalShareButton>
                </IonCol>

            </IonRow>
        </IonContent>
    </IonModal>
        </>
}