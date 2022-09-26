import * as React from 'react';
import {
    IonAvatar,
    IonButton,
    IonCol,
    IonIcon,
    IonCheckbox,
    IonItem,
    IonLabel,
    IonRow,
    IonTextarea,
    useIonToast, IonBadge, IonContent
} from '@ionic/react'
import {
    chatboxEllipsesOutline, chatbubbleEllipsesOutline,
    happyOutline,
    imageOutline,
    rocketOutline, thumbsUpOutline
} from "ionicons/icons";
import {Message, MessageType, MsgText, MsgTextImage, TribeInfo, TribeRole, UserLimit} from "../../../../types";
import {LoremIpsum} from "lorem-ipsum";
import {tribeService} from "../../../../service/tribe";
import {EmojiBlock} from "../../../Emojis/block";
import {usePopperTooltip} from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import config from "../../../../common/config";
import {saveDataState} from "../../../../common/state/slice/dataSlice";
import {useAppDispatch, useAppSelector} from "../../../../common/state/app/hooks";
import {useEffect, useState} from "react";
import {ReplayText} from "../Message/Types/ReplayText";
import selfStorage from "../../../../common/storage";
import {RolesPopover} from "../../../Role/RolesPopover";
import {SendImageModal} from "./SendImageModal";
import TextareaAutosize from 'react-textarea-autosize';
import {ThemeColors} from "../../../../common/getMainColor";
import {utils} from "../../../../common";

interface Props {
    selectRole?: TribeRole
    showPin: boolean;
    onPin: () => void;
    roles: Array<TribeRole>
    onRoleCheck: (role: TribeRole) => void;
    userLimit: UserLimit;
    tribeInfo: TribeInfo
    owner: string;
}


const lorem = new LoremIpsum({
    wordsPerSentence: {
        max: 32,
        min: 4
    }
});

export const BottomBar: React.FC<Props> = ({showPin, roles, tribeInfo, owner, userLimit, onRoleCheck, onPin, selectRole}) => {
    const textRef = React.useRef("")
    const [present, dismiss] = useIonToast();
    const [replayMsg, setReplayMsg] = useState(null);
    const [showSelectRole, setShowSelectRole] = useState(false);

    const [displayImage, setDisplayImage] = useState({});
    const [themeColor, setThemeColor] = useState(null);

    const [loading, setLoading] = useState(false);

    const [cursorPosition, setCursorPosition] = useState(-1);
    const {
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible,
    } = usePopperTooltip({
        placement: "top-end",
        interactive: true,
        delayHide: 100,
        closeOnTriggerHidden: true,
        closeOnOutsideClick: true,
        followCursor: true
    });
    // const popper = usePopperTooltip({
    //     placement: "top-end",
    //     interactive: true,
    //     delayHide: 100,
    //     closeOnTriggerHidden: true,
    //     closeOnOutsideClick: true,
    //     followCursor: true
    // });


    // useEffect(()=>{
    //     //@ts-ignore
    //     if( emo){
    //         //@ts-ignore
    //         textRef.current.value = textRef.current.value+emo;
    //     }
    // },[textRef,emo])
    const dispatch = useAppDispatch();
    const dispatchData = useAppSelector(state => state.jsonData);
    useEffect(() => {
        if (dispatchData) {
            if (dispatchData.tag == 'replayMsg' && dispatchData.data) {
                let dataObj = JSON.parse(dispatchData.data);
                console.log("bottom receive data",)
                if (dataObj["msg"]) {
                    setReplayMsg(dataObj["msg"])
                }
                dispatch(saveDataState({data: JSON.stringify({msg: null}), tag: 'replayMsg'}))
            }
        }
    }, [dispatchData.data]);
    const sendMsg = async (f?: boolean) => {
        if (textRef && textRef.current) {
            //@ts-ignore
            let value: any = textRef.current.value;
            if (f) {
                value = lorem.generateSentences(1);
            }
            if (value) {
                const contentData = `0x${Buffer.from(JSON.stringify({content: value} as MsgText)).toString("hex")}`
                await tribeService.pushTribe({
                    tribeId: config.tribeId,
                    msgType: MessageType.Text,
                    content: contentData,
                    role: selectRole.id,
                    replayToMsgId: replayMsg && (replayMsg as Message).id
                })
                //@ts-ignore
                if (textRef && textRef.current) {
                    //@ts-ignore
                    textRef.current.value = "";
                    //@ts-ignore
                    textRef.current.focus()
                }
                if (replayMsg) {
                    setReplayMsg(null);
                }
            }
        }
    }
    const typeInTextarea = (newText, e: any) => {
        // let cursorPosition = e.selectionStart

        let textBeforeCursorPosition = e.value.substring(0, cursorPosition)
        let textAfterCursorPosition = e.value.substring(cursorPosition)
        e.value = textBeforeCursorPosition + newText + textAfterCursorPosition
    }

    const removeInvalidCharacters = (event) => {
        const regex = /[|&;$%@"<>()+,]/g;
        const text = event.target.value;

        if (text.match(regex)) {
            return [text.replace(regex, ""), event.target.selectionStart - 1];
        }
        return [text.replace(regex, ""), event.target.selectionStart];
    }
    const themeColors = themeColor as ThemeColors;

    const emitChanges = (event) => {
        const [text, caretPosition] = removeInvalidCharacters(event);
        // console.log(text,caretPosition)
        setCursorPosition(caretPosition);
    }

    // const avatar = utils.convertImgDisplay()

    return <div className="msg-bottom">
        {
            !showPin ?
                <IonRow>
                    <IonCol size="12">
                        <IonRow>
                            <IonCol size="7">
                                {
                                    selectRole && <div className="bottom-role">
                                        <div className="avatar" onClick={() => {
                                            setShowSelectRole(true)
                                        }}>
                                            <IonAvatar slot="start">
                                                <img src={utils.getDisPlayUrl(selectRole.avatar)}/>
                                            </IonAvatar>
                                        </div>
                                        <div className="bottom-role-name">
                                            <div style={{transform: 'translate(-10px,4px)'}}>
                                                {
                                                    tribeInfo && tribeInfo.keeper !== owner && <IonBadge>
                                                        {/*<small>Role</small>*/}
                                                        {userLimit && <>&nbsp;
                                                            <IonIcon src={chatbubbleEllipsesOutline}
                                                                     style={{transform: 'translateY(2px)'}}/><small>{userLimit.msgLeft}</small> &nbsp;
                                                            <IonIcon src={thumbsUpOutline}
                                                                     style={{transform: 'translateY(2px)'}}/><small>{userLimit.supportLeft}</small>
                                                        </>}
                                                    </IonBadge>
                                                }
                                            </div>
                                            <div className="btn-name">
                                                {selectRole.name} &nbsp;
                                                <IonIcon color="medium" src={chatboxEllipsesOutline}
                                                         style={{transform: 'translateY(3px)'}}/>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </IonCol>
                            <IonCol size="5">
                                <div className="msg-bottom-icon">
                                    {/*<div>*/}
                                    <IonIcon className="footer-icon" src={happyOutline} ref={setTriggerRef} color="dark"
                                             size="large"
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 if (textRef && textRef.current) {
                                                     //@ts-ignore
                                                     // const value:any = textRef.current.value;
                                                     const value = lorem.generateSentences(1);
                                                     if (value) {
                                                     }
                                                 }
                                             }}/>
                                    {visible && (
                                        <div
                                            style={{zIndex: 100001}}
                                            ref={setTooltipRef}
                                            {...getTooltipProps({className: 'tooltip-container'})}
                                        >
                                            <EmojiBlock onSelectEmoji={(v) => {
                                                typeInTextarea(v.emoji, textRef.current);
                                                // if (textRef && textRef.current) {
                                                //     //@ts-ignore
                                                //     textRef.current.value = textRef.current.value + v.emoji
                                                // }
                                            }}/>
                                            {/*<div {...getArrowProps({ className: 'tooltip-arrow' })} />*/}
                                        </div>
                                    )}

                                    {/*</div>*/}
                                    <IonIcon className="footer-icon" src={imageOutline} color="dark" size="large"
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 tribeService.picUpload().then(({url, themeColors}) => {
                                                     const displayImage = utils.convertImgDisplay(themeColors.width, themeColors.height, url);
                                                     setDisplayImage({
                                                         url: url,
                                                         width: displayImage.width,
                                                         height: displayImage.height
                                                     });

                                                     setThemeColor(themeColors)
                                                 })
                                             }}/>
                                    {/*<IonIcon className="footer-icon" src={diceOutline} color="dark" size="large" onClick={(e) => {*/}
                                    {/*    e.stopPropagation();*/}
                                    {/*    if (textRef && textRef.current) {*/}
                                    {/*        //@ts-ignore*/}
                                    {/*        // const value:any = textRef.current.value;*/}
                                    {/*        const value = lorem.generateSentences(1);*/}
                                    {/*        if (value) {*/}
                                    {/*        }*/}

                                    {/*    }*/}
                                    {/*}}/>*/}
                                    <IonIcon className="footer-icon" src={rocketOutline} color="dark" size="large" onClick={(e) => {
                                        e.stopPropagation();
                                        sendMsg(true).then(() => {
                                            dispatch(saveDataState({
                                                data: JSON.stringify({refresh: 0}),
                                                tag: 'scrollToItem'
                                            }))
                                        }).catch(e => {
                                            const err = typeof e == 'string' ? e : e.message;
                                            present({
                                                message: err,
                                                duration: 2000,
                                                position: "top",
                                                color: "danger"
                                            })
                                            console.error(e)
                                        })
                                    }}/>
                                </div>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size="10">
                                <div>
                                    {
                                        //@ts-ignore
                                        <TextareaAutosize onBlur={emitChanges.bind(this)} id="msgText" autoFocus rows={1} maxLength={1024} ref={textRef} wrap='hard'
                                                          placeholder="Your messages" className="msg-input"/>
                                    }
                                    {
                                        replayMsg && <ReplayText msg={replayMsg} onClose={() => {
                                            setReplayMsg(null)
                                        }
                                        }/>
                                    }
                                </div>
                            </IonCol>
                            <IonCol size="2">
                                <div className="msg-bottom-icon2">
                                    <IonButton className="footer-btn" disabled={loading} onClick={() => {
                                        setLoading(true)
                                        sendMsg().then(() => {
                                            setLoading(false)
                                            dispatch(saveDataState({
                                                data: JSON.stringify({refresh: 0}),
                                                tag: 'scrollToItem'
                                            }))
                                        }).catch(e => {
                                            setLoading(false)
                                            const err = typeof e == 'string' ? e : e.message;
                                            present({
                                                message: err,
                                                duration: 2000,
                                                position: "top",
                                                color: "danger"
                                            })
                                            console.error(e)
                                        })
                                    }}>SEND</IonButton>
                                </div>
                            </IonCol>
                        </IonRow>

                    </IonCol>
                </IonRow> :
                <IonRow>
                    <IonCol size="4">
                        <IonItem lines="none">
                            <IonCheckbox onIonChange={(e) => {
                                const checked = e.detail.checked;
                                // const arr = document.getElementsByName("pinMsgId");
                                // for (let i = 0; i < arr.length; i++) {
                                //     //@ts-ignore
                                //     document.getElementsByName("pinMsgId")[i].checked = checked
                                // }
                                dispatch(saveDataState({
                                    data: JSON.stringify({refresh: true, checked: checked}),
                                    tag: 'checkedAllMsg'
                                }))
                            }}></IonCheckbox>
                            <IonLabel>All</IonLabel>
                        </IonItem>
                    </IonCol>
                    <IonCol size="8">
                        <IonButton expand="block" onClick={() => {
                            const msgIds = selfStorage.getItem('tribe_pin_arr');
                            if (msgIds) {
                                tribeService.summarizeTribe(config.tribeId, msgIds).then(() => {
                                    selfStorage.setItem("tribe_pin_arr", [])
                                    onPin()
                                }).catch(e => {
                                    console.log(e)
                                })
                            }
                        }}>Pin</IonButton>
                    </IonCol>
                </IonRow>
        }


        <SendImageModal url={displayImage["url"]} width={displayImage["width"]} height={displayImage["height"]}
                        onOk={(text: string) => {
                            // const url =  tribeService.picDisplay(imageUrl, 100, 100);
                            const obj = {image: displayImage} as MsgText;
                            if (text) {
                                obj.content = text;
                            }
                            const contentData = `0x${Buffer.from(JSON.stringify(obj)).toString("hex")}`
                            tribeService.pushTribe({
                                tribeId: config.tribeId,
                                msgType: MessageType.Text,
                                content: contentData,
                                role: selectRole.id
                            }).then(() => {
                                //@ts-ignore
                                if (textRef && textRef.current) {
                                    //@ts-ignore
                                    // textRef.current.value = "";
                                }
                                setDisplayImage({})
                                dispatch(saveDataState({
                                    data: JSON.stringify({refresh: 0}),
                                    tag: 'scrollToItem'
                                }))
                            }).catch(e => {
                                console.error(e)
                                const err = typeof e == 'string' ? e : e.message;
                                present({
                                    message: err,
                                    duration: 2000,
                                    position: "top",
                                    color: "danger"
                                })
                            })
                        }} onClose={() => setDisplayImage({})} isOpen={!!displayImage["url"]}/>
        <RolesPopover isOpen={showSelectRole} onClose={() => {
            setShowSelectRole(false)
        }} defaultRole={selectRole} roles={roles} onRoleCheck={(role) => {
            setShowSelectRole(false)
            onRoleCheck(role)
        }}/>

    </div>
}