// An enum with all the types of actions to use in our reducer
import {Message, MessageStatus, MessageType, PinnedSticky} from "../../../../types";
import {tribeService} from "../../../../service/tribe";
import BigNumber from "bignumber.js";

export enum MessageActionKind {
    RESET = 'RESET',
    PREPEND = 'PREPEND',
    COMBINE = 'COMBINE',
}

// An interface for our actions
interface MessageAction {
    type: MessageActionKind;
    payload: {
        total: number;
        comments: Array<PinnedSticky>;
        firstItemIndex: number;
        append?: boolean;
        visibleRange?: { startIndex: number, endIndex: number },
        keeper?: string
    };
}

// An interface for our state
export interface MessageState {
    total: number;
    comments: Array<PinnedSticky>
    firstItemIndex: number
}


function combile(comp: Array<PinnedSticky>, keeper: string): Array<PinnedSticky> {
    if (!comp || comp.length == 0) {
        return [];
    }
    const ret: Array<PinnedSticky> = [];
    let msgIndex = comp[0].records[0].msgIndex;
    let groupByTime: { role: string, timestamp: number, groupId: string, owner: string } = null;
    let lastPin: PinnedSticky = null;
    for (let i = 0; i < comp.length; i++) {
        let pMsg = JSON.parse(JSON.stringify(comp[i]));
        const nextMsg = i < comp.length ? comp[i + 1] : null
        if ((pMsg as PinnedSticky).records && (pMsg as PinnedSticky).records[0]) {
            const msg: Message = (pMsg as PinnedSticky).records[0];
            if (msg.msgType !== MessageType.Role) {
                msg.hideTime = !!groupByTime && groupByTime.role == msg.role && groupByTime.groupId == msg.groupId && (Math.floor(groupByTime.timestamp / 300) == Math.floor(msg.timestamp / 300));

                if (groupByTime && keeper && (
                    groupByTime.owner == keeper && msg.owner !== keeper ||
                    groupByTime.owner !== keeper && msg.owner == keeper
                )) {
                    if (!msg.groupId) {
                        msg.hideTime = false;
                    }
                }
                groupByTime = {role: msg.role, timestamp: msg.timestamp, groupId: msg.groupId, owner: msg.owner};
            } else {
                msg.hideTime = false;
                groupByTime = null;
            }

            msg.msgIndex = msgIndex++;
        }

        pMsg.showPin = {
            // lastPin: JSON.parse(JSON.stringify(comp[i])),
            showPin: lastPin && lastPin.groupId !== pMsg.groupId,
            showFork: !nextMsg && !!pMsg.groupId || nextMsg && nextMsg.groupId !== pMsg.groupId
        };
        ret.push(pMsg)

        lastPin = pMsg;
    }

    return ret;
}

function _sort(a:PinnedSticky, b: PinnedSticky) {
    if(!a || !b){
       return 0
    }
    return new BigNumber(a.records[0].seq).comparedTo(new BigNumber(b.records[0].seq));
}

// Our reducer function that uses a switch statement to handle our actions
export function messageReducer(state: MessageState = {
    total: 0,
    comments: [],
    firstItemIndex: 0
}, action: MessageAction): MessageState {
    const {type, payload} = action;
    const {total, firstItemIndex, comments} = state;
    switch (type) {
        case MessageActionKind.PREPEND:
            const comb = combile([...payload.comments, ...comments], payload.keeper);
            return {total: total, comments: comb, firstItemIndex: payload.firstItemIndex};
        case MessageActionKind.RESET:
            return {total: payload.total, comments: combile(payload.comments, payload.keeper), firstItemIndex: payload.firstItemIndex};
        case MessageActionKind.COMBINE:
            const preComments = comments;
            const messages = payload.comments;

            // messages.sort(_sort)
            const nextComments = [];
            let commentsCopy: Array<PinnedSticky> = [...preComments];

            // let total = 0 ;
            for (let index = 0; index < messages.length; index++) {
                const _comment = messages[index];

                // remove all unpinned msg when pin type
                if (_comment && _comment.records && _comment.records.length > 0 && _comment.records[0].msgType == MessageType.Pin) {
                    tribeService.init().catch(e => console.error(e));
                    //TODO
                    // onReload();
                } else if (_comment.records && _comment.records.length > 0 && _comment.records[0].msgType == MessageType.UpdateTribe) {
                } else {
                    const _index = commentsCopy.findIndex(v => (v.records && v.records.length > 0 && _comment && _comment.records && _comment.records.length > 0 && v.records[0].id == _comment.records[0].id))
                    //new message
                    if (_index == -1) {
                        if (_comment.records && _comment.records[0].msgStatus !== MessageStatus.removed) {
                            if (commentsCopy.length > 0) {

                                const latest: PinnedSticky = commentsCopy[commentsCopy.length - 1];
                                const latestSeq = new BigNumber(_comment.records && _comment.records.length > 0 && _comment.records[0].seq);
                                if (new BigNumber(latest.records && latest.records.length > 0 && latest.records[0].seq).comparedTo(
                                    latestSeq
                                ) == -1) {
                                    nextComments.push(_comment)
                                    // total++
                                } else {
                                    const index = commentsCopy.findIndex(msg => msg.records && msg.records.length > 0 && new BigNumber(msg.records[0].seq).comparedTo(latestSeq) == 1)
                                    if (index > -1) {
                                        nextComments.push(_comment)
                                        // change seq
                                        // console.log("=====> change seq", index, _comment.records[0].msgIndex, commentsCopy[index].records[0].msgIndex, commentsCopy.length, nextComments.length)
                                        // commentsCopy.splice(index, 1, ...[_comment, commentsCopy[index]])
                                    }
                                }
                            } else {
                                nextComments.push(_comment)
                            }
                        }
                    } else {
                        //removed
                        if (_comment.records && _comment.records.length > 0 && _comment.records[0].msgStatus == MessageStatus.removed) {
                            commentsCopy.splice(_index, 1)
                            // total--;
                        } else { //support or edit
                            commentsCopy.splice(_index, 1, _comment);
                            // total++
                        }
                    }
                }

                //TODO refresh data
                // if (_comment.records && _comment.records.length > 0 && _comment.records[0].owner == owner) {
                //     onReload(true);
                // }

            }
            // console.log("=========> commentsCopy>>>", commentsCopy, nextComments, append, visibleRange.endIndex , total);
            const _cIndex = commentsCopy.findIndex(v => v.records[0].groupId == "");
            // console.log("=========> commentsCopy>>> c_index=[%d], copy=[%d], next=[%d]",_cIndex,commentsCopy.length, nextComments.length )
            let _comments = [];
            if (commentsCopy.length == 0 || _cIndex >= 0 || payload.append || payload.visibleRange.endIndex == total - 1) {
                const comp = [...commentsCopy, ...nextComments];
                _comments = combile(comp, payload.keeper)
            }else{
                _comments = combile(commentsCopy, payload.keeper)
            }
            // console.log("return _comments = ", _comments)
            return {total: payload.total, comments: _comments, firstItemIndex: firstItemIndex};
        default:
            return state;
    }
}

export const messageInitializer = (initialState: any) => {
    return initialState
};