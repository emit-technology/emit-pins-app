import * as React from "react";
import {useEffect, useState} from "react";
import addCircleIcon from "../../img/add_circle.png";

import {IonLoading,IonAvatar} from "@ionic/react";
import ImageUploading from "react-images-uploading";
import getMainColor from "../../common/getMainColor";

interface ImgInfo {
    imgUrl: string,
    setImgUrl: (image:{data_url:string, file:File}, width: number, height: number, file: File)=>void,
    width?: any,
    height?: number,
    setColor?:(bg:string,font:string,badge:any, text:any)=>void
    defaultIcon?:any;
    borderRadio?:any
    maxHeight?:number
}

const UploadImage = ({imgUrl, setImgUrl,width = 120,height,setColor,defaultIcon, borderRadio = 0, maxHeight}: ImgInfo) => {

    const [showLoading, setShowLoading] = useState(false);

    const [images, setImages] = React.useState([]);
    const maxNumber = 69;

    useEffect(()=>{
        if(!imgUrl){
            setImages([])
        }
    },[imgUrl])

    const onChange = async (imageList, addUpdateIndex) => {
        // data for submit
        // console.log(imageList, addUpdateIndex);
        if(!imageList || imageList.length == 0){
            return
        }
        setImages(imageList);
        const image = imageList[0];
        const themeColors = await getMainColor(image["data_url"]);
        setImgUrl(image, themeColors.width, themeColors.height, image["file"])

        console.log("onChange==> ", themeColors, imageList);
        if(setColor){
            const palette = themeColors;
            if(palette && palette.primary && palette.palette){
                let bgColor = palette.primary;
                setColor(bgColor,palette.palette[0],palette.badge,palette.text);
            }
        }
    };

    return <>
        <IonLoading
            cssClass='my-custom-class'
            isOpen={showLoading}
            onDidDismiss={() => setShowLoading(false)}
            message={'Please wait...'}
            duration={60000}
        />

        <ImageUploading
            multiple
            value={images}
            onChange={(imageList, addUpdateIndex)=>{
                onChange(imageList, addUpdateIndex).catch(e=>console.log(e))
            }}
            maxNumber={maxNumber}
            dataURLKey="data_url"
        >
            {({
                  imageList,
                  onImageUpload,
                  onImageRemoveAll,
                  onImageUpdate,
                  onImageRemove,
                  isDragging,
                  dragProps,
              }) => (
                // write your building UI
                <div className="upload__image-wrapper">
                    <img className='cursor' style={{width:width,maxHeight: maxHeight ,height: height?height:width,objectFit:"cover",borderRadius: borderRadio}}
                         src={imageList.length>0?imageList[0]['data_url']:(imgUrl?imgUrl:defaultIcon?defaultIcon:addCircleIcon) } onClick={()=>{
                        if(imageList.length == 0){
                            onImageUpload()
                        }else{
                            onImageUpdate(0)
                        }
                    }}
                         {...dragProps}
                    />
                    {/*<button onClick={onImageRemoveAll}>Remove all images</button>*/}
                    {/*{imageList.map((image, index) => (*/}
                    {/*    <div key={index} className="image-item">*/}
                    {/*        <img src={image['data_url']} alt="" width="100" />*/}
                    {/*        <div className="image-item__btn-wrapper">*/}
                    {/*            <button onClick={() => onImageUpdate(index)}>Update</button>*/}
                    {/*            <button onClick={() => onImageRemove(index)}>Remove</button>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*))}*/}
                </div>
            )}
        </ImageUploading>

        {/*<img onClick={()=>{*/}
        {/*    setShowLoading(true)*/}
        {/*    uploadImage().then(()=>{*/}
        {/*        setShowLoading(false)*/}
        {/*    }).catch(e=>{*/}
        {/*        setShowLoading(false)*/}
        {/*    })*/}
        {/*}} className='cursor' style={{width:width,height: height?height:width,objectFit:"cover",borderRadius: borderRadio}}*/}
        {/*     src={imgUrl?imgUrl:defaultIcon?defaultIcon:addCircleIcon}/>*/}
    </>

};

export default UploadImage;