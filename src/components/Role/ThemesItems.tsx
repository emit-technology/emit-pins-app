import * as React from 'react';
import {GroupMsg, PinnedSticky, TribeTheme} from "../../types";
import {
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
} from "@ionic/react";
import {ThemeItem} from "./ThemeItem";
import {arrowBackOutline, chevronBackOutline} from "ionicons/icons";
import {utils} from "../../common";

interface Props{
    groupMsg: Array<GroupMsg>;
    onClose:()=>void;
    onClickTheme:(groupId: string)=>void;

    checkedGroupId?: string
}

const ThemesItemsChild:React.FC<Props> = ({groupMsg,onClickTheme,onClose, checkedGroupId}) =>{

    return <>
        <div className="role-list-box">
            <div style={{display: "flex", flexDirection: 'column'}}>
                <IonItem lines="none">
                    <IonLabel slot="start">
                        <div className="head-themes">
                            <div>Pins</div>
                            <div>.</div>
                            <div>{groupMsg && groupMsg.length}</div>
                        </div>
                    </IonLabel>
                    {
                        !utils.isApp() &&  <div slot="end">
                            <IonButton expand="block" onClick={()=>{
                                onClose();
                            }}><IonIcon src={arrowBackOutline}/></IonButton>
                        </div>
                    }
                </IonItem>
            </div>
            <div className="role-list-content2">
                <div className="theme-roles-box">
                    {
                        groupMsg && groupMsg.map((v, i) => {
                            const seq = i == groupMsg.length -1 ?0:(i+1);
                            return <div style={{padding: '8px 12px', height: 160 ,position: "relative", }}  key={i} onClick={()=>{
                                onClickTheme(v.groupId)
                            }}>
                                <ThemeItem theme={v.theme} roles={v.roles} seq={seq} checked={ checkedGroupId == v.groupId}/>
                            </div>
                        })
                    }
                </div>
            </div>

        </div>
    </>
}

export const ThemesItems = React.memo(ThemesItemsChild);