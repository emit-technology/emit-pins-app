import * as React from 'react';

import { generateUsers } from "./data";

import {Virtuoso} from 'react-virtuoso'
import {LoremIpsum} from "lorem-ipsum";
import {useCallback, useState} from "react";


const lorem = new LoremIpsum({
    wordsPerSentence: {
        max: 32,
        min: 4
    }
});

const MessageContentVisualsoTest2Child = ({}) => {
    const START_INDEX = 10000
    const INITIAL_ITEM_COUNT = 100

    const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX)
    const [users, setUsers] = useState(() => generateUsers(INITIAL_ITEM_COUNT, START_INDEX))

    const prependItems = useCallback(() => {
        const usersToPrepend = 20
        const nextFirstItemIndex = firstItemIndex - usersToPrepend

        setTimeout(() => {
            setFirstItemIndex(() => nextFirstItemIndex)
            setUsers(() => [...generateUsers(usersToPrepend, nextFirstItemIndex), ...users])
        }, 500)

        return false
    }, [firstItemIndex, users, setUsers])

    return (
        <Virtuoso
            style={{ height: "100%" }}
            firstItemIndex={firstItemIndex}
            initialTopMostItemIndex={INITIAL_ITEM_COUNT - 1}
            data={users}
            startReached={prependItems}
            itemContent={(index, user) => {
                return (
                    <div style={{ backgroundColor: user.bgColor, padding: '1rem 0.5rem' }}>
                        <h4>
                            {user.index}. {user.name}
                        </h4>
                        <div style={{ marginTop: '1rem' }}>{user.description}</div>
                        {
                            index % 3 == 0 && <div style={{ marginTop: '1rem', backgroundColor: "green" }}>{user.description}</div>
                        }
                    </div>
                )
            }}
        />
    )
}


export const MessageContentVisualsoTest2 = React.memo(MessageContentVisualsoTest2Child);