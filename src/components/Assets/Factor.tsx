import * as React from 'react';
import {
    IonButton,
    IonText,
    IonButtons,
    IonAvatar,
    IonContent,
    IonHeader,
    IonLabel,
    IonItemDivider,
    IonItem,
    IonChip,
    IonBadge,
    IonModal,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import {Factor} from "@emit-technology/emit-lib";
import {utils} from "../../common";
import {arrowForwardOutline, chevronForwardOutline} from "ionicons/icons";

interface Props {
    factor: Factor;
    showLine?: boolean;
    noTransform?: boolean
    hideDetail?: boolean
}

export const FactorItem: React.FC<Props> = ({factor, showLine, hideDetail, noTransform}) => {

    const symbol = noTransform ? factor.category.symbol : utils.fromHex(factor.category.symbol);

    return <>
        {
            factor &&
            <IonItem detail={!hideDetail} detailIcon={arrowForwardOutline} lines={showLine ? "inset" : "none"}>
                <IonAvatar slot="start">
                    <img src={`${utils.assetUrl()}/assets/img/tokens/${symbol}.png`}/>
                </IonAvatar>
                <IonLabel className="ion-text-wrap">
                    <IonBadge color="primary">{symbol} [{utils.ellipsisStr(factor.category.supplier, 5)}]</IonBadge>
                </IonLabel>

                <IonLabel style={{textAlign: 'right'}}>
                    <span style={{fontSize: 20,fontFamily: "SFBold"}}  slot="end">
                        <IonText color="primary">{noTransform ? utils.fromValue(factor.value, 18).toString(10) : utils.fromHexValue(factor.value, 18).toString(10)}</IonText>
                    </span>&nbsp;
                </IonLabel>
            </IonItem>
        }
    </>
}