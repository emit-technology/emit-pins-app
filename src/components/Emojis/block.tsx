import * as React from 'react';
import {emojis,EmojiType} from "./data";
import Emoji from 'react-emojis';
import useVirtual from "react-cool-virtual";

interface Props {
    onSelectEmoji: (v:EmojiType)=>void;
}

export const EmojiBlock: React.FC<Props> = ({onSelectEmoji}) => {

    const colNum = 7;
    const {outerRef, innerRef, items} = useVirtual({
        itemCount: Math.ceil(emojis.length / colNum), // Provide the total number for the list items
        itemSize: 32, // The size of each item (default = 50)
    });

    return <>
        {
            //@ts-ignore
            <div ref={outerRef} // Attach the `outerRef` to the scroll container
                 style={{width: "300px", height: "300px", overflow: "auto"}}
            >
                {/* Attach the `innerRef` to the wrapper of the items */}
                {
                    //@ts-ignore
                    <div ref={innerRef}>
                        {
                            items.map(({index, size}) => {
                                const start = index * colNum;
                                const end = start + colNum;
                                const ret:Array<any> = [];
                                for(let i = start ;i<end;i++){
                                    const v = emojis[i];
                                    if(v){
                                        ret.push(<div key={`${index}_${i}`} onClick={()=>{
                                            onSelectEmoji(v);
                                        }}><Emoji emoji={v.nameUrl} size="30"/></div>)
                                    }
                                }
                                return <div key={index} style={{height: `${size}px`}}>
                                   <div style={{display:"flex",flexDirection:"row",justifyContent:"space-around",width:"100%"}}>
                                       {ret}
                                   </div>
                                </div>;
                            })
                        }
                    </div>
                }
            </div>
        }
    </>
}