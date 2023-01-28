import * as React from 'react';
import {
    IonAvatar,
    IonButton,
    IonCol,
    IonButtons,
    IonIcon,
    IonCheckbox,
    IonItem,
    IonLabel,
    IonRow,
    useIonToast, IonLoading, IonFooter,
} from '@ionic/react'
import {
    chatboxEllipsesOutline, diceOutline,
    happyOutline,
    imageOutline, rocketOutline,
} from "ionicons/icons";
import {Message, MessageType, MsgText, TribeInfo, TribeRole, UserLimit} from "../../../../types";
import {LoremIpsum} from "lorem-ipsum";
import {tribeService} from "../../../../service/tribe";
import {EmojiBlock} from "../../../Emojis/block";
import {usePopperTooltip} from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import config from "../../../../common/config";
import {saveDataState} from "../../../../common/state/slice/dataSlice";
import {useAppDispatch, useAppSelector} from "../../../../common/state/app/hooks";
import {useEffect, useRef, useState} from "react";
import {ReplayText} from "../Message/Types/ReplayText";
import selfStorage from "../../../../common/storage";
import {RolesPopover} from "../../../Role/RolesPopover";
import {SendImageModal} from "./SendImageModal";
import TextareaAutosize from 'react-textarea-autosize';
import {ThemeColors} from "../../../../common/getMainColor";
import {utils} from "../../../../common";
import {AirdropModal} from "./AirdropModal";

interface Props {
    selectRole?: TribeRole
    showPin: boolean;
    onPin: () => void;
    roles: Array<TribeRole>
    onRoleCheck: (role: TribeRole) => void;
    userLimit: UserLimit;
    tribeInfo: TribeInfo
    owner: string;
    isTokenValid: boolean;
    alreadySelectRole: boolean;
}


const lorem = new LoremIpsum({
    wordsPerSentence: {
        max: 32,
        min: 4
    }
});

const BottomBarChild: React.FC<Props> = ({showPin, alreadySelectRole, roles, isTokenValid, tribeInfo, owner, userLimit, onRoleCheck, onPin, selectRole}) => {
    const textRef = useRef(null);
    const [present, dismiss] = useIonToast();
    const [replayMsg, setReplayMsg] = useState(null);
    const [showSelectRole, setShowSelectRole] = useState(false);

    const [displayImage, setDisplayImage] = useState({});
    const [themeColor, setThemeColor] = useState(null);

    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [showAirdropModal, setShowAirdropModal] = useState(false);
    const [isDown, setIsDown] = useState(false);
    const [showSendImage, setShowSendImage] = useState(false);

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
        followCursor: true,
        trigger: ['click', 'hover']
    });

    const dispatch = useAppDispatch();
    const dispatchData = useAppSelector(state => state.jsonData);

    const dispatchMessage = useAppSelector(state => state.messageData);

    useEffect(() => {
        if (dispatchData) {
            if (dispatchData.tag == 'replayMsg' && dispatchData.data) {
                let dataObj = JSON.parse(dispatchData.data);
                if (dataObj["msg"]) {
                    setReplayMsg(dataObj["msg"])
                }
            }
        }
    }, [dispatchData.data]);


    useEffect(() => {
        if (dispatchMessage) {
            if (dispatchMessage.tag == 'isScrollDown' && dispatchMessage.data) {
                let dataObj: any = dispatchMessage.data;
                setIsDown(dataObj.isScrollDown);
            }
        }
    }, [dispatchMessage.data]);

    const sendMsg = async (f?: boolean) => {
        if (userLimit && userLimit.msgLeft <= 0) {
            return Promise.reject(`reaching the max number(${userLimit.maxMsgCount}) of likes`)
        }
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
                    // textRef.current.focus()
                }
                if (replayMsg) {
                    setReplayMsg(null);
                }
            }
        }
    }

    const sendAirdrop = async () => {
        setShowAirdropModal(false);
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
    // const themeColors = themeColor as ThemeColors;

    const emitChanges = (event) => {
        const [text, caretPosition] = removeInvalidCharacters(event);
        // console.log(text,caretPosition)
        setCursorPosition(caretPosition);
    }

    // const avatar = utils.convertImgDisplay()

    return <>
        {
            !isDown && <IonFooter>
                <div className={`msg-bottom`}>
                    {
                        !showPin ?
                            <IonRow>
                                <IonCol size="12">
                                    <IonRow>
                                        <IonCol size="7">
                                            {
                                                selectRole && <div className="bottom-role">
                                                    <div
                                                        className={`avatar ${(!alreadySelectRole && roles.length > 1 && selectRole && !selectRole.id) && "avatarn"}`}
                                                        onClick={() => {
                                                            setShowSelectRole(true)
                                                        }}>
                                                        <IonAvatar slot="start" style={{position: "relative"}}>
                                                            <img src={utils.getDisPlayUrl(selectRole.avatar)}/>
                                                            {
                                                                selectRole && selectRole.roleType && <div style={{position: "absolute",top: "24px", right: "-5px"}}>
                                                                    <img src="./assets/img/icon/nokiTag.png" height={16} width={16} />
                                                                </div>
                                                            }
                                                        </IonAvatar>
                                                    </div>
                                                    <div className="bottom-role-name">
                                                        <div style={{
                                                            // transform: 'translate(-10px,4px)'
                                                            width: "1px"
                                                        }}>
                                                            {/*{*/}
                                                            {/*    tribeInfo && tribeInfo.keeper !== owner && <IonBadge>*/}
                                                            {/*        <small>Role</small>*/}
                                                            {/*        {userLimit && <>&nbsp;*/}
                                                            {/*            <IonIcon src={chatbubbleEllipsesOutline}*/}
                                                            {/*                     style={{transform: 'translateY(2px)'}}/><small>{userLimit.msgLeft}</small> &nbsp;*/}
                                                            {/*            <IonIcon src={thumbsUpOutline}*/}
                                                            {/*                     style={{transform: 'translateY(2px)'}}/><small>{userLimit.supportLeft}</small>*/}
                                                            {/*        </>}*/}
                                                            {/*    </IonBadge>*/}
                                                            {/*}*/}
                                                        </div>
                                                        <div className="btn-name">
                                                            {selectRole.name}
                                                            {/*<IonIcon color="medium" src={chatboxEllipsesOutline}*/}
                                                            {/*         style={{transform: 'translateY(3px)'}}/>*/}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </IonCol>
                                        <IonCol size="5">
                                            <div className="msg-bottom-icon">
                                                {/*<div>*/}
                                                {/*<IonIcon className="footer-icon" src={happyOutline} ref={setTriggerRef}*/}
                                                {/*         color="dark"*/}
                                                {/*         size="large"*/}
                                                {/*         onClick={(e) => {*/}
                                                {/*             e.stopPropagation();*/}
                                                {/*         }}/>*/}

                                                <img src="./assets/img/icon/emojOutline.png" height={24}
                                                     ref={setTriggerRef} onClick={(e) => {
                                                    e.stopPropagation();
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


                                                <img src="./assets/img/icon/imageOutline.png" height={24}
                                                     onClick={(e) => {
                                                         e.stopPropagation();
                                                         setShowSendImage(true);
                                                         // tribeService.userCheckAuth().then(() => {
                                                         //     if (userLimit && userLimit.msgLeft <= 0) {
                                                         //         present({
                                                         //             message: `Sending messages has reached the maximum limit ${userLimit.maxMsgCount}`,
                                                         //             duration: 2000,
                                                         //             position: "top",
                                                         //             color: "danger"
                                                         //         })
                                                         //         return;
                                                         //     }
                                                         //     tribeService.picUpload().then(photo => {
                                                         //         setIsLoading(true);
                                                         //         tribeService.uploadToServer(photo).then(({url, themeColors}) => {
                                                         //             setIsLoading(false)
                                                         //             const displayImage = utils.convertImgDisplay(themeColors.width, themeColors.height, url);
                                                         //             setDisplayImage({
                                                         //                 url: url,
                                                         //                 width: displayImage.width,
                                                         //                 height: displayImage.height
                                                         //             });
                                                         //
                                                         //             setThemeColor(themeColors)
                                                         //         }).catch(e => {
                                                         //             setIsLoading(false)
                                                         //         })
                                                         //     }).catch(e => {
                                                         //         // const err = typeof e == 'string' ? e : e.message;
                                                         //         // present({
                                                         //         //     message: err,
                                                         //         //     duration: 2000,
                                                         //         //     position: "top",
                                                         //         //     color: "danger"
                                                         //         // })
                                                         //         console.log(e)
                                                         //     })
                                                         // }).catch(e => {
                                                         //     console.error(e)
                                                         //     const err = typeof e == 'string' ? e : e.message;
                                                         //     present({
                                                         //         message: err,
                                                         //         duration: 2000,
                                                         //         position: "top",
                                                         //         color: "danger"
                                                         //     })
                                                         // })
                                                     }}/>

                                                {/*<IonIcon className="footer-icon" src={imageOutline} color="dark"*/}
                                                {/*         size="large"*/}
                                                {/*         onClick={(e) => {*/}
                                                {/*             */}
                                                {/*         }}/>*/}


                                                {/*<IonIcon className="footer-icon" src={rocketOutline} color="dark"*/}
                                                {/*         size="large" onClick={(e) => {*/}
                                                {/*    e.stopPropagation();*/}
                                                {/*    tribeService.userCheckAuth().then(() => {*/}
                                                {/*        setShowAirdropModal(true)*/}
                                                {/*    }).catch(e => {*/}
                                                {/*        console.error(e)*/}
                                                {/*        const err = typeof e == 'string' ? e : e.message;*/}
                                                {/*        present({*/}
                                                {/*            message: err,*/}
                                                {/*            duration: 2000,*/}
                                                {/*            position: "top",*/}
                                                {/*            color: "danger"*/}
                                                {/*        })*/}
                                                {/*    })*/}
                                                {/*}}/>*/}

                                                <img src="./assets/img/icon/airdropOutline.png" onClick={(e) => {
                                                    e.stopPropagation();
                                                    tribeService.userCheckAuth().then(() => {
                                                        setShowAirdropModal(true)
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

                                                }} height={24}/>

                                                {/*<IonIcon className="footer-icon" src={diceOutline} color="dark" size="large"*/}
                                                {/*         onClick={(e) => {*/}
                                                {/*             e.stopPropagation();*/}
                                                {/*             sendMsg(true).then(() => {*/}
                                                {/*                 dispatch(saveDataState({*/}
                                                {/*                     data: JSON.stringify({refresh: 0}),*/}
                                                {/*                     tag: 'scrollToItem'*/}
                                                {/*                 }))*/}
                                                {/*             })*/}
                                                {/*         }}/>*/}
                                            </div>
                                        </IonCol>
                                    </IonRow>
                                    <IonRow>
                                        <IonCol size="12">
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginTop: 8
                                            }}>
                                                <div className="input-shadow">
                                                    {

                                                        <TextareaAutosize onChange={(e) => {
                                                            if (e.target.value && e.target.value.indexOf("/mind") == 0) {
                                                                //@ts-ignore
                                                                if (textRef.current) {
                                                                    //@ts-ignore
                                                                    textRef.current.value = textRef.current.value.replace("/mind", "💭");
                                                                }
                                                            }
                                                            //@ts-ignore
                                                        }} onBlur={emitChanges.bind(this)} id="msgText" rows={1}
                                                                          style={{backgroundColor: "#fff"}}
                                                                          maxLength={1024} ref={textRef} wrap='hard'
                                                                          placeholder={tribeInfo && owner !== tribeInfo.keeper && userLimit ? `msg (${userLimit && userLimit.msgLeft}/${userLimit && userLimit.maxMsgCount}) , likes (${userLimit && userLimit.supportLeft}/${userLimit && userLimit.maxSupportCount}) ` : `Your messages`}
                                                                          className="msg-input"/>

                                                    }
                                                    {
                                                        replayMsg && <ReplayText msg={replayMsg} onClose={() => {
                                                            setReplayMsg(null)
                                                            dispatch(saveDataState({
                                                                data: JSON.stringify({msg: null}),
                                                                tag: 'replayMsg'
                                                            }))
                                                        }
                                                        }/>
                                                    }
                                                </div>

                                                <div className="msg-bottom-icon2">
                                                    <IonButtons>
                                                        {
                                                            //@ts-ignore
                                                            <IonButton className="footer-btn" disabled={loading}
                                                                       onClick={() => {
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
                                                                       }}>
                                                                <span className="fonter-btn-text">Send</span>
                                                            </IonButton>
                                                        }
                                                    </IonButtons>
                                                </div>
                                            </div>
                                        </IonCol>
                                    </IonRow>

                                </IonCol>
                            </IonRow> :
                            <IonRow>
                                <IonCol size="4">
                                    <IonItem lines="none" color="tertiary">
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
                </div>
            </IonFooter>


        }
        <SendImageModal isOpen={showSendImage} onClose={() => setShowSendImage(false)} onOk={() => {
            setShowSendImage(false);
            dispatch(saveDataState({
                data: JSON.stringify({refresh: 0}),
                tag: 'scrollToItem'
            }))
        }} selectRole={selectRole}/>

        <RolesPopover isOpen={showSelectRole} onClose={() => {
            setShowSelectRole(false)
        }} defaultRole={selectRole} roles={roles} onRoleCheck={(role) => {
            setShowSelectRole(false)
            onRoleCheck(role)
        }}/>

        <AirdropModal actor={selectRole} onOk={() => sendAirdrop()} onClose={() => setShowAirdropModal(false)}
                      owner={owner} isOpen={showAirdropModal}/>
        <IonLoading
            cssClass='my-custom-class'
            isOpen={isLoading}
            onDidDismiss={() => setIsLoading(false)}
            message={'Please wait...'}
            duration={60000}
        />
    </>
}

export const BottomBar = React.memo(BottomBarChild);