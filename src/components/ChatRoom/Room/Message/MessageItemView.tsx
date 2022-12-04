import * as React from 'react';
import {createContext, FC, forwardRef, useCallback, useEffect, useLayoutEffect, useRef} from "react";

import {VariableSizeList as List} from 'react-window';
import {PinnedSticky, TribeInfo} from "../../../../types";
import {MessageItem} from "./MessageItem";
import {useWindowResize} from "./useWindowResize";
import AutoSizer from "react-virtualized-auto-sizer";

interface Props {
    comments: Array<PinnedSticky>;
    checkedMsgArr?: Array<string>;
    showPin: boolean;
    owner: string;
    tribeInfo: TribeInfo;
    onSupport?: (msgId: string, f: boolean) => void;
    onFork?: (groupId: string, forkTribeInfo: TribeInfo) => void;
    checkedMsgId?: string;
}

export const StickyList:React.FC<Props> = ({
                               comments,
                               checkedMsgArr,
                               showPin,
                               owner,
                               tribeInfo,
                               onSupport,
                               checkedMsgId,
                               onFork,
                               ...rest
                           }) => {


    const listRef = useRef();
    const sizeMap = useRef({});
    const setSize = useCallback((index, size) => {
        console.log("setSize  ", index, size)
        sizeMap.current = {...sizeMap.current, [index]: size};
        //@ts-ignore
        listRef.current.resetAfterIndex(index);
    }, []);
    const getSize = React.useCallback(index => sizeMap.current[index] || 50, []);
    const [windowWidth] = useWindowResize();

    return <AutoSizer>
        {({height, width}) =>{
            //@ts-ignore
            return <List ref={listRef}
                         height={height}
                         width={width}
                         itemSize={getSize}
                         itemCount={comments.length}
            >
                {({ index, style }) => (
                    <div key={index} style={style}>
                        <MessageItem index={index} pinnedSticky={comments[index]} total={comments.length}
                                     atBottom={false} firstItemIndex={-1} checkedMsgArr={checkedMsgArr}
                                     showPin={showPin} owner={owner} setSize={setSize} windowWidth={windowWidth} />
                    </div>
                )}
            </List>
        }}
    </AutoSizer>

}