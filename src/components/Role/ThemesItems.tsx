import * as React from 'react';
import {GroupMsg, PinnedSticky} from "../../types";
import {
    IonAvatar, IonButton,
    IonContent,
    IonHeader, IonIcon,
    IonItem,
    IonLabel, IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import {ThemeItem} from "./ThemeItem";
import {arrowBackOutline, chevronBackOutline} from "ionicons/icons";
import {saveDataState} from "../../common/state/slice/dataSlice";
import {useAppDispatch} from "../../common/state/app/hooks";

interface Props{
    groupMsg: Array<GroupMsg>;
    onClose:()=>void;
}

export const ThemesItems:React.FC<Props> = ({groupMsg,onClose}) =>{
    const dispatch = useAppDispatch();

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
                    <div slot="end">
                        <IonButton expand="block" onClick={()=>{
                            onClose();
                        }}><IonIcon src={arrowBackOutline}/></IonButton>
                    </div>
                </IonItem>
            </div>
            <div className="role-list-content2">
                <div className="theme-roles-box">
                    {
                        groupMsg && groupMsg.map((v, i) => {
                            const seq = i == groupMsg.length -1 ?0:(i+1);
                            return <div key={i} onClick={()=>{
                                dispatch(saveDataState({data: JSON.stringify({refresh: seq == 0 ? 9999999: seq}), tag: 'scrollToItem'}))
                            }}>
                                <ThemeItem theme={v.theme} roles={v.roles} seq={seq} />
                            </div>
                        })
                    }
                </div>
            </div>

        </div>
    </>
}