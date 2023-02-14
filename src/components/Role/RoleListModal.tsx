import * as React from 'react';
import {useCallback, useEffect, useLayoutEffect, useState} from 'react'
import {
    IonAvatar,
    IonHeader,
    IonIcon, IonText,
    IonItem,
    IonLabel,
    IonPage,
    IonContent, IonToolbar, IonLoading
} from "@ionic/react";
import {
    addCircleOutline,
    createOutline,
    layersOutline,
    openOutline,
    personOutline
} from "ionicons/icons";
import {GroupMsg, PinnedSticky, TribeInfo, TribeRole, TribeTheme} from "../../types";
import {RoleEditModal} from "./RoleEditModal";
import {ThemeItem} from "./ThemeItem";
import {ThemesItems} from "./ThemesItems";
import {utils} from "../../common";
import {tribeService} from "../../service/tribe";
import {useAppDispatch, useAppSelector} from "../../common/state/app/hooks";
import {saveDataState} from '../../common/state/slice/dataSlice';
import {saveMessageState} from '../../common/state/slice/messageSlice';

interface Props {
    roles: Array<TribeRole>
    defaultRole: TribeRole;
    onRoleCheck: (v: TribeRole) => void;
    onReloadList: () => void;

    isModal?: boolean

    tribeInfo: TribeInfo

    groupMsg: Array<GroupMsg>;

}

const RoleListModalChild: React.FC<Props> = ({
                               roles,groupMsg, isModal,
                               tribeInfo, onRoleCheck, defaultRole, onReloadList
                           }) => {

    const [showRoleModal, setShowRoleModal] = React.useState(false);

    const [roleInfo, setRoleInfo] = React.useState(null);
    const [showThemes, setShowThemes] = React.useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [pinnedSticky, setPinnedSticky] = useState(null);

    const dispatchData = useAppSelector(state => state.jsonData);

    const dispatch = useAppDispatch();

    const _lineRoles = roles.filter(v=> !v.id || !!v.roleType)

    const genContent = (content: string) =>{
        let urlIndex = -1 ;
        if(content && content.indexOf("https://")>-1){
            urlIndex = content.indexOf("https://");
        }else if(content && content.indexOf("http://")>-1){
            urlIndex = content.indexOf("http://");
        }
        if(urlIndex > -1) {
            let _url = content.slice(urlIndex);
            if (_url.indexOf(" ") > -1) {
                _url = _url.slice(0, _url.indexOf(" "))
            }
            return <>
                {content.slice(0, content.indexOf(_url))}
                <div className="text-pre-link" onClick={()=>window.open(_url)}>&nbsp;&nbsp;&nbsp;&nbsp;<span className="tex-pre-link-text">{_url}</span></div>
                {content.slice(content.indexOf(_url) + _url.length)}
            </>
        }
        return content;
    }

    const onClickTheme = useCallback((groupId: string)=>{


        const preGroupIndex = tribeService.groupIdCache().findIndex(v=>v == groupId);
        if(!groupId){
            const stickyMsg = {
                theme: tribeInfo && tribeInfo.theme,
                    seq: -1,
                    roles: [],
                    records: [],
                    groupId: groupId,
                    index: -1
            }
            setPinnedSticky(stickyMsg);
            dispatch(saveMessageState({
                data: {stickyMsg: stickyMsg},
                tag: 'updateThemeHead'
            }))
        }else{
            tribeService.groupedMsg([groupId]).then(rest=>{
                const groupMsg = rest[0];
                const stickyMsg = {
                    theme: groupMsg.theme,
                    seq: preGroupIndex+1,
                    roles: [],
                    records: [],
                    groupId: groupId,
                    index: preGroupIndex +1
                };
                setPinnedSticky(stickyMsg)
                dispatch(saveMessageState({
                    data: {stickyMsg: stickyMsg},
                    tag: 'updateThemeHead'
                }))
            })
        }

        setImmediate(()=>{
            tribeService.getMsgPositionWithGroupId(groupId).then(position=>{
                dispatch(saveDataState({
                    data: {firstIndex: position},
                    tag: 'setFirstIndex'
                }))
            })
        })
    },[])

    useEffect(() => {
        if (dispatchData) {
            // console.log(dispatchData)
            if (dispatchData.tag == 'updateThemeRight' && dispatchData.data) {
                let dataObj:any = dispatchData.data;
                if (dataObj.stickyMsg) {
                    setPinnedSticky(dataObj.stickyMsg)
                }
            }
        }
    }, [dispatchData.data]);


    return <>
                {
                    !isModal && tribeInfo && tribeInfo.forked  && tribeInfo.forked.length>0 && <IonHeader mode="ios" collapse="condense">
                        <IonToolbar className="msg-toolbar">
                            {/*<div style={{fontWeight:700,fontSize:'16px',textAlign:"center"}}>Manage</div>*/}
                            <div style={{textAlign:'center'}}>
                                {
                                    tribeInfo && tribeInfo.forked  && tribeInfo.forked.length>0 && <div>
                                        <IonText color="medium"><small style={{fontWeight:700}}>Forked from {tribeInfo.forked[0].tribeId}</small></IonText>
                                        <IonIcon style={{transform:'translateY(3px)',cursor:'pointer'}} size="small" src={openOutline} color="medium" onClick={()=>{
                                            utils.goTo(tribeInfo.forked[0].tribeId)
                                        }}/>
                                    </div>
                                }
                            </div>
                        </IonToolbar>
                    </IonHeader>
                }
                <IonContent  className="ion-content-chat">
                    {
                        tribeInfo && (!tribeInfo.forked  || tribeInfo.forked.length  == 0)  && <div style={{height: (utils.isIos()) ?"30px": "12px"}}></div>
                    }
                    <div style={{height: (!showThemes && !utils.isApp()) ?"0":"100%" }}>
                        <ThemesItems onClickTheme={onClickTheme} groupMsg={groupMsg} checkedGroupId={pinnedSticky && (pinnedSticky as PinnedSticky).groupId}  onClose={()=>{
                            setShowThemes(false)
                        }}/>
                    </div>

                    {
                        !utils.isApp() && <div className="role-list-box"  style={{height: !showThemes?"98%":"0px"}}>
                            <div style={{display: "flex", flexDirection: 'column'}}>
                                <IonItem lines="none">
                                    <IonLabel slot="start">
                                        <div className="head-themes">
                                            <div>Pins</div>
                                            <div>.</div>
                                            <div>{(groupMsg ?groupMsg.length : 0)}</div>
                                        </div>
                                    </IonLabel>
                                    <IonIcon src={layersOutline} className="theme-icon" color="medium" slot="end" onClick={() => {
                                        setShowThemes(true)
                                    }} size="small"/>
                                    {/*<IonIcon src={addCircleOutline} className="theme-icon" color="medium" slot="end" onClick={() => {*/}
                                    {/*    setShowTribeModal(true)*/}
                                    {/*}} size="small"/>*/}
                                </IonItem>

                                <div style={{height: 160, padding: "0 20px", position: "relative"}}>
                                    <ThemeItem
                                        theme={isModal && tribeInfo ?tribeInfo.theme: pinnedSticky && pinnedSticky.groupId?pinnedSticky.theme:tribeInfo&&tribeInfo.theme}
                                        roles={pinnedSticky && pinnedSticky.groupId?pinnedSticky.roles:roles}
                                        seq={pinnedSticky&&pinnedSticky.groupId ?pinnedSticky.seq:0}
                                    />
                                </div>
                                <div style={{padding: "0 12px"}}>
                                    {
                                        isModal|| pinnedSticky && !pinnedSticky.groupId ? <div className="theme-pinned-box">
                                                <div>{tribeInfo && tribeInfo.theme.themeTag}</div>
                                                <div  className="text-pre">
                                                    {genContent(tribeInfo && tribeInfo.theme.themeDesc)}
                                                </div>
                                            </div>
                                            :
                                            <div className="theme-pinned-box">
                                                <div>{pinnedSticky && pinnedSticky.theme.themeTag}</div>
                                                <div className="text-pre">
                                                    {genContent(pinnedSticky && pinnedSticky.theme.themeDesc)}
                                                </div>
                                            </div>
                                    }
                                </div>
                                <IonItem lines="none">
                                    <IonLabel>
                                        <div className="head-themes">
                                            <div>Roles</div>
                                            <div>.</div>
                                            <div>{roles&&roles.length}</div>
                                        </div>
                                    </IonLabel>
                                    <IonIcon src={addCircleOutline} className="theme-icon" color="medium" slot="end" onClick={() => {
                                        setRoleInfo(null)
                                        setShowRoleModal(true)
                                    }} size="small"/>
                                </IonItem>
                            </div>
                            <div className="role-list-content">
                                <div className="theme-roles-box">
                                    {
                                        roles && roles.map((v, i) => {
                                            return <IonItem
                                                className="role-item"
                                                lines={(_lineRoles && _lineRoles.length>0 && _lineRoles[_lineRoles.length - 1].id == v.id) ? "full" : "none"}
                                                style={{borderRadius: (i == 0) ? "12px 12px 0 0" : i == roles.length - 1 ? "0 0 12px 12px" : ""}}
                                                color="tertiary" key={i} onClick={(e) => {
                                                e.persist();
                                                onRoleCheck(v)
                                            }}>
                                                <IonAvatar slot="start" className="ion-avatar2">
                                                    <img src={utils.getDisPlayUrl(v.avatar)}/>
                                                    {
                                                        v && v.roleType && <div style={{position: "absolute",top: "14px", right: "-4px"}}>
                                                            <img src="./assets/img/icon/nokiTag.png" height={14} width={14} />
                                                        </div>
                                                    }
                                                </IonAvatar>
                                                <IonLabel>
                                                    <span style={{color: defaultRole && v.id == defaultRole.id?'':'#868990'}} className="role-name-text">{v.name}</span>
                                                    {/*<p><IonText color="medium">{v.desc}</IonText></p>*/}
                                                </IonLabel>
                                                {
                                                    defaultRole && v.id == defaultRole.id && <img src={"./assets/img/icon/personOutline.png"} height={18}/>
                                                    // <IonIcon slot="end" src={personOutline} size="small"/>
                                                }
                                                {
                                                    (i > 0 ) &&
                                                    <IonIcon size="small" slot="end" src={createOutline} color="medium"
                                                             onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 setRoleInfo(v);
                                                                 setShowRoleModal(true)
                                                             }}/>
                                                }
                                            </IonItem>
                                        })
                                    }
                                </div>
                                <RoleEditModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} onOk={(tribeRole) => {
                                    setShowRoleModal(false)
                                }} roleInfo={roleInfo}/>
                            </div>
                            <IonLoading
                                cssClass='my-custom-class'
                                isOpen={showLoading}
                                onDidDismiss={() => setShowLoading(false)}
                                message={'Please wait...'}
                                duration={50000}
                            />
                        </div>
                    }
                </IonContent>
    </>
}

export const RoleListModal = React.memo(RoleListModalChild);