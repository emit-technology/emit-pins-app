import * as React from 'react';
import {PhotoProvider, PhotoView} from "react-photo-view";
import {utils} from "../../common";

interface Props{
    url: string;
    width: number;
    height: number;

    disW?: number;
    disH?: number;
}

export const ImageView:React.FC<Props> = ({url,width, height,disH,disW}) =>{

    const _imgDisplay = utils.convertImgDisplay(width,height,url);

    if(!disW){
        disW = _imgDisplay.width;
    }
    if(!disH){
        disH = _imgDisplay.height;
    }
    return <>
        <PhotoProvider maskOpacity={0.8}>
            <PhotoView src={url}>
                <img src={_imgDisplay.displayUrl} style={{
                    borderRadius: "12px",
                    width: `${disW}px`,
                    // height: '100%',
                    height: `${disH}px`,
                    objectFit: 'cover',
                    verticalAlign: "middle"
                }}/>
            </PhotoView>
        </PhotoProvider>

    </>
}