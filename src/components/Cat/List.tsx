import * as React from 'react';
import {CatInfo} from "../../types/cat";
import {CatItem} from "./Item";
import {
    IonButton,
    IonRow,
    IonCol,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar, IonIcon, IonMenuToggle, IonLoading
} from "@ionic/react";
import './index.scss';
import {utils} from "../../common";
import {useCallback, useLayoutEffect, useState} from "react";
import {saveDataState} from "../../common/state/slice/dataSlice";
import {useAppDispatch} from "../../common/state/app/hooks";
import {tribeService} from "../../service/tribe";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    items: Array<CatInfo>
    onAdoptCat: () => void;
    nokiData: null | { nokiId: string, nokiReward: number, opType: string }
}

function getRewardNumber(reward: number) {
    return Math.floor(reward / 100)
}

export const CatList: React.FC<Props> = ({items, isOpen, onClose, onAdoptCat, nokiData}) => {

    const [nokiParams, setNokiParams] = useState(null);
    const [showLoading, setShowLoading] = useState(false);

    useLayoutEffect(()=>{
       setNokiParams(nokiData)
    },[nokiData])

    const reloadNoki = useCallback(() => {
        setNokiParams(null);
    }, [])

    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="noki-ion-modal" initialBreakpoint={0.75}
                  breakpoints={[0, 0.75]}>
            <IonContent className="noki-ion-content">
                {
                    (!nokiParams || Math.floor(nokiParams.nokiReward/100) === 0 || !items || items.length == 0 || items && items.length > 0 && nokiParams.nokiId !== items[0].id) &&
                    <div className="noki-box">
                        <div className="noki-content">
                            <div className="noki-body-box">
                                {
                                    items && items.length > 0 && <div className="noki-status-text">
                                        {items[0].status === 0 ? <div>Inactive</div> :
                                            <div className="noki-status-active">Activated</div>}
                                    </div>
                                }
                                {/*<div><IonIcon src={closeOutline} size="large"/></div>*/}
                                <div className={`noki-body ${items && items.length > 0 && 'noki-body-exist'}`}>
                                    {
                                        items && items.length == 0 && <>
                                            <div className="noki-title">
                                                <div><img src="./assets/img/noki/catOutline.png"/></div>
                                                <div>YOUR<br/>NOKI</div>
                                            </div>
                                            <div>
                                                <img src="./assets/img/noki/noki-team.png"/>
                                            </div>
                                            <div>
                                                <div>
                                                    <div>Seems like you don’t</div>
                                                    <div>have a cat yet.</div>
                                                    <div>Adopt one right now!</div>
                                                </div>
                                            </div>
                                        </>
                                    }
                                    {
                                        items && items.length > 0 && <>
                                            <div className="cat-item-width">
                                                <CatItem catInfo={items[0]} onComplete={reloadNoki}/>
                                            </div>
                                        </>
                                    }
                                </div>
                                {
                                    items && items.length == 0 &&
                                    <div className="noki-body-btn" onClick={() => onAdoptCat()}>
                                        <img src="./assets/img/noki/catBlack.png" height={26}/>
                                        Get your Noki for free.
                                    </div>
                                }
                                <div className={`noki-bottom-text ${items && items.length > 0 && 'noki-exist'} `}>
                                    {
                                        items && items.length > 0 && <>
                                            <div style={{color: "#E82929", letterSpacing: "-0.41px", marginBottom: 12}}>
                                                <div><img src="./assets/img/icon/attantion.png" height={20}/></div>
                                                In order to keep your pet on your account, you need to bind your pet on
                                                TWITTER for a limited time.
                                            </div>
                                            <div className="noki-item-2">
                                                <div className="font-symbol">?</div>
                                                {
                                                    items[0].status === 0 ? <div className="noki-text-btn" onClick={() => {
                                                        setShowLoading(true)
                                                        tribeService.activateTweet().then(twid=>{
                                                            setShowLoading(false)
                                                            window.open(`https://twitter.com/intent/retweet?tweet_id=${twid}`)
                                                        }).catch(e=>{
                                                            setShowLoading(false)
                                                        })
                                                    }}>
                                                        Activate <img src="./assets/img/noki/outLine.png" height={20}/>
                                                    </div>:<div className="noki-text-btn" onClick={() => {
                                                        setShowLoading(true)
                                                        tribeService.feedTweet().then(twid=>{
                                                            setShowLoading(false)
                                                            window.open(`https://twitter.com/intent/retweet?tweet_id=${twid}`)
                                                        }).catch(e=>{
                                                            setShowLoading(false)
                                                        })
                                                    }}>
                                                        <img src="./assets/img/noki/catPlus.png" height={28}/>&nbsp;Upgrade
                                                    </div>
                                                }
                                            </div>

                                            <div className="noki-item-3">
                                                <div className="noki-title">
                                                    <div style={{width: "50%"}}><img
                                                        src="./assets/img/noki/catOutline.png"/></div>
                                                    <div>YOUR<br/>NOKI</div>
                                                </div>
                                                <div>
                                                    Each Noki is a unique Noki, a Noki with your own identity in PINS.
                                                    It gives you the power to create the Verse.
                                                </div>
                                            </div>
                                        </>
                                    }
                                    {
                                        items && items.length == 0 && <>
                                            <div>Each Noki is a unique Noki.</div>
                                            <div>A Noki with your own identity in PINS.</div>
                                            <div>It gives you the power to create the Verse.</div>
                                        </>
                                    }
                                </div>

                            </div>

                        </div>

                        <div className="noki-bottom">
                            <div>

                            </div>
                        </div>
                    </div>
                }
                {
                    !!nokiParams && !!items && items.length > 0 && nokiParams.nokiId === items[0].id && nokiParams.nokiReward > 0 &&
                    <div>
                        <div className="noki-content">
                            <div className="noki-body-box">
                                <div className='noki-body'>
                                    {
                                        items && items.length > 0 && <>
                                            <div className="noki-reward-head">
                                                <div className="noki-title" style={{width: '100%'}}>
                                                    <div><img src="./assets/img/noki/catOutline.png"/></div>
                                                    <div>YOUR<br/>NOKI</div>
                                                </div>
                                                <div className="noki-reward-text">
                                                    Congratulations!<br/>
                                                    #{utils.ellipsisStr(items[0].id, 5)}
                                                </div>
                                            </div>
                                            <div className="noki-reward-img">
                                                <img src={utils.getDisPlayUrl(items[0].image)} width={280} height={280}
                                                     style={{
                                                         borderRadius: "20px",
                                                         width: `${194}px`,
                                                         // height: '100%',
                                                         height: `${194}px`,
                                                         objectFit: 'cover',
                                                         verticalAlign: "middle"
                                                     }}/>
                                            </div>
                                            <div className="noki-reward-number">
                                                {/*text-shadow: 0px 0px 15px rgba(255, 255, 255, 0.3), 0px 0px 50px rgba(223, 252, 13, 0.85);*/}
                                                Your Noki got <span style={{
                                                textShadow: nokiParams.nokiReward >= 1000 ? `0px 0px 15px rgba(255, 255, 255, 0.3), 0px 0px 50px rgba(223, 252, 13, 0.85)`
                                                    : `0px 0px 25px rgba(255, 255, 255, 0.5)`
                                            }}>{getRewardNumber(nokiParams.nokiReward)}</span> Friendships!
                                            </div>
                                        </>
                                    }

                                    <div style={{position: "absolute", top: 0}}>
                                        <img
                                            src={`./assets/img/noki/noki-reward-${nokiParams.nokiReward <= 1000 ? 'large' : 'small'}.png`}
                                            style={{borderRadius: "28px 28px 0 0"}}/>
                                    </div>
                                </div>
                                <div className="noki-reward-ok" onClick={(e)=>{
                                    e.stopPropagation();
                                    reloadNoki()
                                }}>
                                    <img src="./assets/img/noki/catBlack.png" height={24}/>&nbsp;OK
                                </div>
                            </div>
                        </div>


                    </div>
                }
                <IonLoading
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    onDidDismiss={() => setShowLoading(false)}
                    message={'Please wait...'}
                    duration={60000}
                />
            </IonContent>
        </IonModal>
    </>
}