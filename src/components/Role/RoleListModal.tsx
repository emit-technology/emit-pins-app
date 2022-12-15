import * as React from 'react';
import {useCallback, useState} from 'react'
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

interface Props {
    roles: Array<TribeRole>
    defaultRole: TribeRole;
    onRoleCheck: (v: TribeRole) => void;
    onReloadList: () => void;

    isModal?: boolean

    tribeInfo: TribeInfo

    groupMsg: Array<GroupMsg>;

    pinnedSticky?: PinnedSticky

    onChangeMsgIndex?: (msgIndex:number)=>void;
}

const RoleListModalChild: React.FC<Props> = ({
                               roles,groupMsg,onChangeMsgIndex, pinnedSticky,isModal,
                               tribeInfo, onRoleCheck, defaultRole, onReloadList
                           }) => {

    const [showRoleModal, setShowRoleModal] = React.useState(false);

    const [roleInfo, setRoleInfo] = React.useState(null);
    const [showThemes, setShowThemes] = React.useState(false);
    const [showLoading, setShowLoading] = useState(false);

    const onClickTheme = useCallback((groupId: string)=>{
        if(!!onChangeMsgIndex){
            tribeService.getMsgPositionWithGroupId(groupId).then(position=>{
                onChangeMsgIndex(position)
            })
        }
    },[])

    return <>
            <IonPage>
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
                <IonContent>
                    {
                        tribeInfo && (!tribeInfo.forked  || tribeInfo.forked.length  == 0)  && <div style={{height: (utils.isIos()) ?"48px": "12px"}}></div>
                    }
                    <div style={{height: (!showThemes && !utils.isApp()) ?"0":"100%" }}>
                        <ThemesItems onClickTheme={onClickTheme} groupMsg={groupMsg}  onClose={()=>{
                            setShowThemes(false)
                        }}/>
                    </div>

                    {
                        !utils.isApp() && <div className="role-list-box"  style={{height: !showThemes?"100%":"0px"}}>
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
                                                    {tribeInfo && tribeInfo.theme.themeDesc}
                                                </div>
                                            </div>
                                            :
                                            <div className="theme-pinned-box">
                                                <div>{pinnedSticky && pinnedSticky.theme.themeTag}</div>
                                                <div className="text-pre">
                                                    {pinnedSticky && pinnedSticky.theme.themeDesc}
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
                                                lines={i == 0 ? "full" : "none"}
                                                style={{borderRadius: (i == 0) ? "12px 12px 0 0" : i == roles.length - 1 ? "0 0 12px 12px" : ""}}
                                                color="tertiary" key={i} onClick={(e) => {
                                                e.persist();
                                                onRoleCheck(v)
                                            }}>
                                                <IonAvatar slot="start" className="ion-avatar2">
                                                    <img src={utils.getDisPlayUrl(v.avatar)}/>
                                                </IonAvatar>
                                                <IonLabel>
                                                    <b style={{fontSize: '12px',color: defaultRole && v.id == defaultRole.id?'':'#868990'}}>{v.name}</b>
                                                    {/*<p><IonText color="medium">{v.desc}</IonText></p>*/}
                                                </IonLabel>
                                                {
                                                    defaultRole && v.id == defaultRole.id && <IonIcon slot="end" src={personOutline} size="small"/>
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
            </IonPage>
    </>
}

export const RoleListModal = React.memo(RoleListModalChild);