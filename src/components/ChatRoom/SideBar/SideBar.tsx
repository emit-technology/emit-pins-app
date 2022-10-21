import * as React from 'react';
import {IonList, IonItemDivider, IonItem, IonLabel, IonButton, IonText, IonIcon, IonMenuToggle} from '@ionic/react';
import {
    arrowForwardOutline,
    homeOutline, listOutline,
    openOutline,
    personOutline,
    swapHorizontalOutline,
    walletOutline
} from "ionicons/icons";
import config from "../../../common/config";
import {AccountModel, ChainType} from "@emit-technology/emit-lib";
import {utils} from "../../../common";
interface Props{
    onRequestAccount: ()=>void;
    account?: AccountModel
    onLogout:()=>void;
    isSessionAvailable:boolean
}

export const SideBar:React.FC<Props> = ({onRequestAccount,account,onLogout,isSessionAvailable}) =>{

    return <>
        {
            window.location.pathname != "/" && <IonItem onClick={()=>{
                if(window.location.pathname != "/"){
                    window.location.href = "/"
                }
            }}>
                <IonIcon slot="start" src={homeOutline} size="large"/>
                <IonLabel>HOME</IonLabel>
            </IonItem>
        }

        <IonItem onClick={()=>{
            onRequestAccount()
        }}>
            <IonIcon slot="start" src={personOutline} size="large"/>
            <IonLabel className="ion-text-wrap">
                <b>{!!account ? account.name:'Person'}</b>
                <p><small>{!!account && utils.ellipsisStr(account.addresses[ChainType.EMIT],3)}</small></p>
            </IonLabel>
            <IonIcon src={swapHorizontalOutline} color="medium" slot="end" size="small"/>
        </IonItem>

        <IonItem onClick={()=>{
            window.open(utils.assetUrl())
        }}>
            <IonIcon slot="start" src={walletOutline} size="large"/>
            <IonLabel>Assets</IonLabel>
            <IonIcon src={openOutline} color="medium" slot="end" size="small"/>
        </IonItem>

        <div style={{height: 30}}>
        </div>
        {
            isSessionAvailable ?<IonButton size="small" expand="block" color="danger" onClick={()=>{
                    onLogout()} }>Logout</IonButton>:
                <IonButton size="small" expand="block" onClick={()=>{
                    onRequestAccount()} }>Login</IonButton>
        }
    </>
}