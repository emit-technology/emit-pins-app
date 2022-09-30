import * as React from 'react';
import {useEffect, useState} from 'react'
import {
    IonAvatar,
    IonCheckbox,
    IonHeader,
    IonIcon, IonText,
    IonItem,
    IonLabel,
    IonPage, IonRow, IonCol,
    IonContent,
    IonButtons, IonButton, IonTitle, IonToolbar, IonLoading, useIonToast
} from "@ionic/react";
import {
    addCircleOutline,
    create,
    createOutline,
    layersOutline,
    openOutline,
    pencilOutline,
    personOutline
} from "ionicons/icons";
import {GroupMsg, PinnedSticky, TribeInfo, TribeRole, TribeTheme} from "../../types";
import {RoleEditModal} from "./RoleEditModal";
import {useAppDispatch, useAppSelector} from "../../common/state/app/hooks";
import {saveDataState} from '../../common/state/slice/dataSlice';
import {ThemeItem} from "./ThemeItem";
import {ThemesItems} from "./ThemesItems";
import {tribeService} from "../../service/tribe";
import {utils} from "../../common";

interface Props {
    roles: Array<TribeRole>
    defaultRole: TribeRole;
    onRoleCheck: (v: TribeRole) => void;
    onReloadList: () => void;

    isModal?: boolean

    tribeInfo: TribeInfo

    groupMsg: Array<GroupMsg>;
}

export const RoleListModal: React.FC<Props> = ({
                               roles,groupMsg,isModal,
                               tribeInfo, onRoleCheck, defaultRole, onReloadList
                           }) => {

    const [showRoleModal, setShowRoleModal] = React.useState(false);
    // const [showTribeModal, setShowTribeModal] = React.useState(false);
    // const [theme, setTheme] = React.useState(tribeInfo && tribeInfo.theme);
    const [pinnedSticky,setPinnedSticky] = React.useState(null);
    const [roleInfo, setRoleInfo] = React.useState(null);
    const [showThemes, setShowThemes] = React.useState(false);
    const [showLoading, setShowLoading] = useState(false);

    const dispatchData = useAppSelector(state => state.jsonData);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (dispatchData) {
            if (dispatchData.tag == 'updateTheme' && dispatchData.data) {
                let dataObj:any = dispatchData.data;
                if (dataObj.stickyMsg) {
                    // const tm:PinnedSticky = selfStorage.getItem("stickyMsg")
                    // setTheme(dataObj.stickyMsg.theme);
                    // setPinnedSticky(null)
                    // setTimeout(()=>{
                        setPinnedSticky(dataObj.stickyMsg)
                    // },100)
                    dispatch(saveDataState({data: {stickyMsg: null, stickyMsgTop: dataObj.stickyMsgTop}, tag: 'updateTheme'}))
                }

            }
        }
    }, [dispatchData.data]);

    useEffect(() => {
        if (tribeInfo) {
            // setTheme(tribeInfo.theme)
            setPinnedSticky({
                roles: roles,
                groupId: "",
                records: [],
                theme: tribeInfo.theme,
                seq: 0,
                index: 0
            })
        }
    }, [tribeInfo]);

    return <>
        <IonPage style={{borderRadius: "0 12px 12px 0"}}>
            {
                !isModal && tribeInfo && tribeInfo.forked  && tribeInfo.forked.length>0 && <IonHeader mode="ios" collapse="condense">
                    <IonToolbar className="msg-toolbar">
                        {/*<div style={{fontWeight:700,fontSize:'16px',textAlign:"center"}}>Manage</div>*/}
                        <div style={{textAlign:'center'}}>
                            {
                                tribeInfo && tribeInfo.forked  && tribeInfo.forked.length>0 && <div>
                                    <IonText color="medium"><small style={{fontWeight:700}}>Forked from {tribeInfo.forked[0].tribeId}</small></IonText>
                                    <IonIcon style={{transform:'translateY(3px)',cursor:'pointer'}} size="small" src={openOutline} color="medium" onClick={()=>{
                                        window.open(`./${tribeInfo.forked[0].tribeId}`)
                                    }}/>
                                </div>
                            }
                        </div>
                    </IonToolbar>
                </IonHeader>
            }
            <IonContent >
                {
                    tribeInfo && (!tribeInfo.forked  || tribeInfo.forked.length  == 0)  && <div style={{height: "12px"}}></div>
                }
                {
                    showThemes && <ThemesItems groupMsg={groupMsg}  onClose={()=>{
                        setShowThemes(false)
                    }}/>
                }
                {
                    !showThemes && <div className="role-list-box">
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

                            <div style={{height: 180}}>
                                {
                                    isModal && tribeInfo ? <ThemeItem theme={tribeInfo.theme} roles={roles} seq={0} />
                                    :pinnedSticky && <ThemeItem theme={pinnedSticky && pinnedSticky.groupId?pinnedSticky.theme:tribeInfo&&tribeInfo.theme} roles={pinnedSticky.groupId?pinnedSticky.roles:roles} seq={pinnedSticky.groupId ?pinnedSticky.seq:0} />
                                }
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
                                            console.log("check role")
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
                                                             console.log("role edit");
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