import * as React from 'react';
import {IonButton, IonButtons,IonAvatar, IonContent, IonHeader,IonLabel,IonItemDivider,IonItem,IonChip,IonBadge, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import {Factor} from "@emit-technology/emit-lib";
import {utils} from "../../common";
import {arrowForwardOutline, chevronForwardOutline} from "ionicons/icons";
import config from "../../common/config";

interface Props {
    factor: Factor;
    showLine?: boolean;
    noTransform?:boolean
}

export const FactorItem: React.FC<Props> = ({factor,showLine,noTransform}) => {

    const symbol = noTransform?factor.category.symbol: utils.fromHex(factor.category.symbol);

    return <>
        {
            factor && <IonItem detail detailIcon={arrowForwardOutline} lines={showLine?"inset":"none"}>
                <IonAvatar slot="start">
                    <img src={`${utils.assetUrl()}/assets/img/tokens/${symbol}.png`}/>
                </IonAvatar>
                <IonLabel className="ion-text-wrap">
                    <div>{symbol}</div>
                    <p>{utils.ellipsisStr(factor.category.supplier,7)}</p>
                </IonLabel>
                <IonLabel color="dark" slot="end">{noTransform?utils.fromValue(factor.value,18).toString(10):utils.fromHexValue(factor.value,18).toString(10)}</IonLabel>
            </IonItem>
        }
    </>
}