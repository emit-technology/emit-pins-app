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
    IonToolbar, IonIcon
} from "@ionic/react";
import './index.scss';
import {closeOutline} from "ionicons/icons";
import {tribeService} from "../../service/tribe";
// import {XBlock, XMasonry} from "react-xmasonry";
// import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
interface Props {
    isOpen: boolean;
    onClose: () => void;
    items: Array<CatInfo>
    onAdoptCat: ()=>void;
}

export const CatList: React.FC<Props> = ({items, isOpen, onClose,onAdoptCat}) => {
    return <>
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose()} className="noki-ion-modal" initialBreakpoint={0.75} breakpoints={[0, 0.75]} >
            <IonContent className="noki-ion-content">
                <div className="noki-box">
                    <div className="noki-content">
                        <div className="noki-body-box">
                            <div className="noki-status-text">
                                <div>Inactivated</div>
                            </div>
                            {/*<div><IonIcon src={closeOutline} size="large"/></div>*/}
                            <div className={`noki-body ${items && items.length > 0 && 'noki-body-exist'}`}>
                                {
                                    items && items.length == 0 && <>
                                        <div className="noki-title">
                                            <div><img src="./assets/img/noki/catOutline.png"/></div>
                                            <div>YOUR NOKI</div>
                                        </div>
                                        <div>
                                            <img src="./assets/img/noki/noki-team.png"/>
                                        </div>
                                        <div>
                                            <div>
                                                <div>Seems like you don’t </div>
                                                <div>have a cat yet.</div>
                                                <div>Adopt one right now!</div>
                                            </div>
                                        </div>
                                    </>
                                }
                                {
                                    items && items.length > 0 && <>
                                        <div className="cat-item-width">
                                          <CatItem catInfo={items[0]}/>
                                       </div>
                                    </>
                                }
                            </div>
                            {
                                items && items.length == 0 && <div className="noki-body-btn" onClick={()=>onAdoptCat()}>
                                    <img src="./assets/img/noki/catBlack.png" height={26}/>
                                    Get your Noki for free.
                                </div>
                            }
                            <div className={`noki-bottom-text ${items && items.length > 0 && 'noki-exist'} `}>
                                <div style={{color: "#E82929", letterSpacing: "-0.41px"}}>
                                    In order to keep your pet on your account, you need to bind your pet on TWITTER for a limited time.
                                </div>
                                <div>Each Noki is a unique Noki.</div>
                                <div>A Noki with your own identity in PINS.</div>
                                <div>It gives you the power to create the Verse.</div>
                            </div>

                        </div>

                    </div>

                    <div className="noki-bottom">
                        <div>

                        </div>
                    </div>
                </div>

            </IonContent>
        </IonModal>
    </>
}