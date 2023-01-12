import * as React from 'react';
import './index.scss';
import {XBlock, XMasonry} from "react-xmasonry";
import {Virtuoso} from 'react-virtuoso'
import {CatInfo} from "../../types/cat";
import config from "../../common/config";
import {ImageView} from "../../components/utils/ImageView";

interface Props {
    router: any;
}

function prefix(num, val) {
    return (new Array(num + 1).join('0') + val).slice(-num);
}

const items: any = Array.from({length: 10000}).map((v, i) => {
    return {
        img: `https://pic.emit.technology/cat/${prefix(6, i)}.png`,
        id: i + 1,
        visibility: 100,
        name: `cat_${i + 1}`,
        createdAt: Math.floor(Date.now() / 1000),
        life: 100,
    } ;
})

export const CatPage: React.FC<Props> = ({router}) => {

    return <>
            <Virtuoso
                style={{height: "100%"}}
                totalCount={3333}
                itemContent={(i, cat) => {
                    const index = i * 3;
                    return <div style={{display: "flex", justifyContent: "space-between", padding: "12px"}}>
                        <div style={{position: "relative"}}>
                            <ImageView url={`https://pic.emit.technology/cat/${prefix(6, index)}.png`} width={300} height={300}/>
                            <div style={{position: "absolute", left: 12, top: 12}}>{index}</div>
                        </div>
                        <div style={{position: "relative"}}>
                            <ImageView url={`https://pic.emit.technology/cat/${prefix(6, index+1)}.png`} width={300} height={300}/>
                            <div style={{position: "absolute", left: 12, top: 12}}>{index+1}</div>
                        </div>
                        <div style={{position: "relative"}}>
                            <ImageView url={`https://pic.emit.technology/cat/${prefix(6, index+2)}.png`} width={300} height={300}/>
                            <div style={{position: "absolute", left: 12, top: 12}}>{index+2}</div>
                        </div>


                    </div>
                }}
            />
    </>
}
