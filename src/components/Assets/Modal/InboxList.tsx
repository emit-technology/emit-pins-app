import * as React from 'react';
import {
    IonButton, IonCard, IonCardSubtitle, IonText,
    IonCardContent, IonBadge,IonCardHeader,IonAvatar,
    IonRow, IonCol,IonCardTitle,IonItem,IonLabel
} from '@ionic/react';
import {SettleResp} from "@emit-technology/emit-lib";
import {utils} from "../../../common";

interface Props {
    item: SettleResp
    onReceive: (SettleResp) => void;
}

export const InboxList: React.FC<Props> = ({item, onReceive}) => {
    const v = item;
    return (<>
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>
                   <small>Num: {v.from_index_key.num}, index: {v.from_index_key.index}</small>
                </IonCardTitle>
                <IonCardSubtitle>
                    {utils.dateFormatStr(new Date(v.factor.timestamp ))}
                </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
                <div  className="balance-span2">
                    <span style={{fontSize: '28px'}}><IonText color="primary">+{utils.fromHexValue(v.factor.factor.value).toString(10)}</IonText></span>&nbsp;
                    <IonBadge>
                        {utils.formatCategoryString(v.factor.factor.category)}&nbsp;
                        <small style={{
                            fontSize: "35%",
                            letterSpacing: "0"
                        }}>[{utils.ellipsisStr(v.factor.factor.category.supplier, 4)}]</small>
                    </IonBadge>
                    {
                        v.factor.factor.category.id && <IonBadge color="secondary">NFT</IonBadge>
                    }
                </div>

                {
                    !v.settled && <IonRow>
                        <IonCol size="7">
                        </IonCol>
                        <IonCol size="5">
                            <IonButton expand="block" size="small" onClick={() => {
                                onReceive(v)
                            }}>Receive</IonButton>
                        </IonCol>
                    </IonRow>
                }
                {
                    v.settled && <IonRow>
                        <IonCol offset="7" size="5">
                            <IonBadge color="medium">Settled</IonBadge>
                        </IonCol>
                    </IonRow>
                }

            </IonCardContent>

        </IonCard>

    </>)
}