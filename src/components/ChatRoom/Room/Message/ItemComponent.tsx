import * as React from 'react'
import {PinnedSticky} from "../../../../types";
import {useLayoutEffect, useState} from "react";
import {MessageItem} from "./MessageItem";

interface Props {

    savedState: any;
    onStateChange: (state: any)=>void;
    onHeightChange: ()=>void;
    item: PinnedSticky
}

export const ItemComponent:React.FC<Props> = ({
                           savedState,
                           onStateChange,
                           onHeightChange,
                           item
                       }) => {
    const [state, setState] = useState(savedState)

    useLayoutEffect(() => {
        if(!!state){
            // onStateChange(state)
            // onHeightChange()
        }
    }, [state])

    return (
        <article className="feed-message">
            <MessageItem index={item.records[0].msgIndex} setCheckedMsgId={()=>{}} pinnedSticky={item} total={2000} atBottom={false} firstItemIndex={0} checkedMsgArr={[]} showPin={false} owner={""} />
        </article>

    )
}