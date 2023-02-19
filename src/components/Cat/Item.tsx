import * as React from 'react';
import {CatInfo} from "../../types/cat";
import {useEffect, useLayoutEffect, useState} from "react";
import {getBackgroundColor, set16ToRgb} from "../../common/getMainColor";
import {utils} from "../../common";
import {IonIcon, useIonAlert} from "@ionic/react";
import {createOutline} from "ionicons/icons";
import {tribeService} from "../../service/tribe";
import {useAppDispatch} from "../../common/state/app/hooks";
import {saveDataState} from "../../common/state/slice/dataSlice";
import {PhotoProvider, PhotoView} from "react-photo-view";
import config from "../../common/config";
import Countdown from 'react-countdown';

interface Props {
    catInfo: CatInfo
    onComplete: ()=>void;
}

export const CatItem: React.FC<Props> = ({catInfo,onComplete}) => {

    const [background, setBackground] = useState("");
    const [name, setName] = useState("");
    const [image, setImage] = useState("");

    const [presentAlert] = useIonAlert();
    const dispatch = useAppDispatch();

    useLayoutEffect(() => {
        const _imgDisplay = utils.convertImgDisplay(280, 280, catInfo.image);
        getBackgroundColor(_imgDisplay.displayUrl).then(bg => {
            setBackground(bg)
            console.log(bg.replace(")", " / 60%)"))
        });
        if (catInfo) {
            setName(catInfo.id == catInfo.name ? "Noki" : catInfo.name)
            setImage(`${config.tribePic}/display?url=${catInfo.image}&w=${280}&h=${280}&op=resize&upscale=1`)
        }
    }, [catInfo])

    return <div className="cat-content">

        <div className="cat-box" style={background ? {
            background: background,
            boxShadow: `0px 16px 20px -12px #000000cc`
        } : {}}>
            <div className="cat-box-img">
                        <>
                            <img src={image}
                                 width={280} height={280}
                                 style={{
                                     borderRadius: "20px",
                                     width: `${280}px`,
                                     // height: '100%',
                                     height: `${280}px`,
                                     objectFit: 'cover',
                                     verticalAlign: "middle"
                                 }}
                            />

                            <div onClick={e => e.persist()} className="cat-box-img-div" style={{
                                background: `rgba(216, 216, 216, ${catInfo.visibility < 100 ? 0.3 : 0})`,
                                backdropFilter: ` blur(${Math.abs(catInfo.visibility - 100) * 0.25}px)`,
                                WebkitBackdropFilter: `blur(${Math.abs(catInfo.visibility - 100) * 0.25}px)`
                            }}></div>
                        </>
            </div>
            <PhotoProvider maskOpacity={0.8}>
                <PhotoView src={catInfo.image}>

            <div className="cat-box-info">
                <div>
                    {
                        catInfo.visibility < 100 && <>
                            <img src="./assets/img/icon/eyeOutline.png" height={16}
                                 style={{verticalAlign: "middle"}}/> Visibility {catInfo.visibility}%
                        </>
                    }
                </div>
                <div className="cat-desc">
                    {
                        catInfo.status !== 0 && <div>
                            <div className="cat-box-info-text1">LIFE</div>
                            <div className="cat-box-info-text2">
                                <img src="./assets/img/icon/lifeOutline.png" height={16}
                                     style={{verticalAlign: "middle", marginRight: 2}}/>
                                {catInfo.life}%
                            </div>
                        </div>
                    }
                    {
                        catInfo.status == 0 && <div>
                            <div className="cat-box-info-text1">The Noki will expire in</div>
                            <div className="cat-box-info-text2">
                                <Countdown date={(catInfo.createAt + 60 * 60)*1000}
                                           intervalDelay={1000}
                                           zeroPadTime={2}
                                           daysInHours
                                           autoStart
                                           onComplete={()=>{
                                               setTimeout(()=>{
                                                   onComplete()
                                               },3000)
                                           }}
                                />
                            </div>
                        </div>
                    }
                    <div>
                        <div>
                            <div className="cat-box-info-text3">{name}
                                &nbsp; <IonIcon src={createOutline} size="small"
                                                style={{transform: "translateY(2px)"}} onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation()

                                    presentAlert({
                                        header: 'Set a name for Noki',
                                        inputs: [{
                                            type: "text",
                                            placeholder: 'Name',
                                        }],
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                role: 'cancel',
                                                handler: () => {
                                                },
                                            },
                                            {
                                                text: 'OK',
                                                role: 'confirm',
                                                handler: (e) => {
                                                    tribeService.setUserNFTName(catInfo.id, e[0]).then(() => {
                                                        setName(e[0])
                                                        dispatch(saveDataState({
                                                            tag: 'initData',
                                                            data: Date.now()
                                                        }))
                                                    })
                                                },
                                            },
                                        ]
                                    })

                                }}/></div>
                            <div className="cat-box-info-text4">#{utils.ellipsisStr(catInfo.id, 5)}</div>
                        </div>
                        <div className="cat-box-info-text1" style={{color: "#6C6C6C"}}>
                            <div>Adopted on</div>
                            <div>{new Date(catInfo.createAt * 1000).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>

                </PhotoView>
            </PhotoProvider>
        </div>

    </div>
}