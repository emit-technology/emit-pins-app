import * as React from 'react';
import {IonButton, IonButtons, IonContent, IonHeader,IonLabel,IonItemDivider,IonItem,IonChip,IonBadge, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import {Factor} from "@emit-technology/emit-lib";
import {utils} from "../../common";
import {chevronForwardOutline} from "ionicons/icons";

interface Props {
    factor: Factor;
    showLine?: boolean;
    noTransform?:boolean
}

export const FactorItem: React.FC<Props> = ({factor,showLine,noTransform}) => {

    return <>
        {
            factor && <IonItem detail detailIcon={chevronForwardOutline} lines={showLine?"inset":"none"}>
                <IonLabel>
                    <IonBadge color="dark">
                        {noTransform?factor.category.symbol: utils.fromHex(factor.category.symbol)}
                        &nbsp;[{utils.ellipsisStr(factor.category.supplier,3)}]
                    </IonBadge>
                    {/*<IonBadge color="medium">{utils.ellipsisStr(factor.category.supplier,3)}</IonBadge>*/}
                </IonLabel>
                <IonBadge color="primary">{noTransform?utils.fromValue(factor.value,18).toString(10):utils.fromHexValue(factor.value,18).toString(10)}</IonBadge>
            </IonItem>
        }
    </>
}