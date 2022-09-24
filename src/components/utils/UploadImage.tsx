import * as React from "react";
import {useState} from "react";
import addCircleIcon from "../../img/add_circle.png";

import {IonLoading,IonAvatar} from "@ionic/react";
import getMainColor from "../../common/getMainColor";
import {tribeService} from "../../service/tribe";

interface ImgInfo {
    imgUrl: string,
    setImgUrl: (url:string, width: number, height: number)=>void,
    width?: any,
    height?: number,
    setColor?:(bg:string,font:string,badge:any, text:any)=>void
    defaultIcon?:any;
    borderRadio?:any
}

const UploadImage = ({imgUrl, setImgUrl,width = 120,height,setColor,defaultIcon, borderRadio = 0}: ImgInfo) => {

    const [showLoading, setShowLoading] = useState(false);

    const uploadImage = async () => {
        const data = await tribeService.picUpload()
        setImgUrl(data.url, data.themeColors.width, data.themeColors.height)
        if(setColor){
            const palette = data.themeColors;
            if(palette && palette.primary && palette.palette){
                let bgColor = palette.primary;
                setColor(bgColor,palette.palette[0],palette.badge,palette.text);
            }
        }
    };

    return <>
        {/*<IonLoading*/}
        {/*    cssClass='my-custom-class'*/}
        {/*    isOpen={showLoading}*/}
        {/*    onDidDismiss={() => setShowLoading(false)}*/}
        {/*    message={'Please wait...'}*/}
        {/*    duration={10000}*/}
        {/*/>*/}
        <img onClick={()=>{
            setShowLoading(true)
            uploadImage().then(()=>{
                setShowLoading(false)
            }).catch(e=>{
                setShowLoading(false)
            })
        }} className='cursor' style={{width:width,height: height?height:width,objectFit:"cover",borderRadius: borderRadio}}
             src={imgUrl?imgUrl:defaultIcon?defaultIcon:addCircleIcon}/>
    </>

};

export default UploadImage;