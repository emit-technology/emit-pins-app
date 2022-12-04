import * as React from 'react';
import {PhotoProvider, PhotoView} from "react-photo-view";
import {utils} from "../../common";
// import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

interface Props{
    url: string;
    width: number;
    height: number;

    disW?: number;
    disH?: number;
}

const ImageViewChild:React.FC<Props> = ({url,width, height,disH,disW}) =>{

    const _imgDisplay = utils.convertImgDisplay(width,height,url);

    if(!disW){
        disW = _imgDisplay.width;
    }
    if(!disH){
        disH = _imgDisplay.height;
    }
    return <div style={{width: disW, height: disH}}>
        <PhotoProvider maskOpacity={0.8}>
            <PhotoView src={url} width={disW} height={disH}>
                <img src={_imgDisplay.displayUrl}
                               width={disW} height={disH}
                               style={{
                                   borderRadius: "12px",
                                   width: `${disW}px`,
                                   // height: '100%',
                                   height: `${disH}px`,
                                   objectFit: 'cover',
                                   verticalAlign: "middle"
                               }}
                />
            </PhotoView>
        </PhotoProvider>

    </div>
}

export const ImageView = React.memo(ImageViewChild)