import * as React from 'react';
import {CatInfo} from "../../types/cat";
import {useEffect, useLayoutEffect, useState} from "react";
import {getBackgroundColor, set16ToRgb} from "../../common/getMainColor";

interface Props {
    catInfo: CatInfo
}

export const CatItem:React.FC<Props> = ({catInfo}) =>{

    const [background, setBackground] = useState("");

    useLayoutEffect(()=>{

        getBackgroundColor(catInfo.img).then(bg=>{

            setBackground(bg)
            console.log(bg.replace(")"," / 60%)"))
        });
    }, [catInfo])

    return <div className="cat-content">
        <div className="cat-box" style={background?{background: background, boxShadow: `0px 16px 20px -12px ${background}cc`}:{}}>
            <div className="cat-box-img">
                <img src={catInfo.img}/>
                <div className="cat-box-img-div" style={{
                    background: `rgba(216, 216, 216, ${catInfo.visibility<100? 0.3:0})`,
                    backdropFilter: ` blur(${Math.abs(catInfo.visibility - 100) * 0.25}px)`,
                    WebkitBackdropFilter: `blur(${Math.abs(catInfo.visibility - 100) * 0.25 }px)`
                }}></div>
            </div>
            <div className="cat-box-info">
                <div>
                    <img src="./assets/img/icon/eyeOutline.png" height={16} style={{verticalAlign: "middle"}}/> Visibility {catInfo.visibility}%
                </div>
                <div className="cat-desc">
                    <div>
                        <div className="cat-box-info-text1">PINs NFT</div>
                        <div className="cat-box-info-text2">
                            <img src="./assets/img/icon/lifeOutline.png" height={16} style={{verticalAlign: "middle",marginRight: 2}}/>
                            100%
                        </div>
                    </div>
                    <div>
                        <div >
                            <div className="cat-box-info-text3">CAT NAME</div>
                            <div className="cat-box-info-text4">#s1</div>
                        </div>
                        <div  className="cat-box-info-text1">
                            <div>Adopted on</div>
                            <div>2022/11/21</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}