import * as React from 'react';
import {
    IonButton,
    IonButtons,IonBadge,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonHeader,
    IonIcon,
    IonModal,
    IonLoading,
    IonTitle,
    IonToolbar,
    IonLabel, useIonToast, useIonLoading
} from "@ionic/react";
import {FactorItem} from "../Factor";
import {NoneData} from "../../Data/None";
import {ChainType, Factor, FactorSet, Settle, SettleResp} from "@emit-technology/emit-lib";
import {useEffect, useState} from "react";
import {emitBoxSdk} from "../../../service/emitBox";
import {InboxList} from "./List";
import walletWorker from "../../../worker/walletWorker";

interface Props {
    address: string;
    isOpen: boolean;
    onClose: ()=>void;
    router?: any;
}
export const AssetsModal:React.FC<Props> = ({isOpen,router ,address, onClose}) =>{

    const [segment, setSegment] = useState("balance");

    const [factors, setFactors] = useState([]);
    const [inbox, setInbox] = useState([]);
    const [present] = useIonToast();
    const [showLoading, setShowLoading] = useState(false);
    useEffect(()=>{
       try{
           init().catch(e=>{console.error(e)})
       }catch (e){
           console.error(e)
       }
    },[isOpen])

    const init = async ()=>{
        const fct:Array<Factor> = await emitBoxSdk.emitBox.emitDataNode.getFactors(address);
        setFactors(fct);
        const inbox:Array<SettleResp> = await emitBoxSdk.emitBox.emitDataNode.getUnSettles(address);
        setInbox(inbox)
    }

    const receive = async (settles: Array<SettleResp>)=>{
        const account = await emitBoxSdk.getAccount();
        const sets: Array<Settle> = [];
        for (let settle of settles) {
            sets.push({
                from: settle.from_index_key.from,
                index: settle.from_index_key.index,
                num: settle.from_index_key.num,
                factor: settle.factor.factor,
            });
        }
        const factorSet: FactorSet = {
            settles: sets,
            outs: [],
        };
        const data = await emitBoxSdk.emitBox.emitDataNode.genPrepareBlock(
            account.addresses[ChainType.EMIT],
            [],
            factorSet,
            ""
        );
        const signData = await walletWorker.signTx(account.accountId,"",ChainType.EMIT.valueOf(),data)
        await emitBoxSdk.emitBox.emitDataNode.prepareBlockWithSign(data,{error: null, result: signData});
    }
    return <>
        <IonModal isOpen={isOpen}
                  presentingElement={router || undefined}
              onDidDismiss={() => onClose()} className="assets-modal" canDismiss>
            <IonHeader collapse="fade">
                <IonToolbar>
                    <IonTitle>EMIT Assets</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonSegment value={segment} className="segment" color="secondary" mode="md" onIonChange={(e)=>{
                    setSegment(e.detail.value)
                }}>
                    <IonSegmentButton value="balance">
                        <span className={segment == "balance"?"seq-title":"seq-title-2"}><IonLabel color="dark">Assets</IonLabel></span>
                    </IonSegmentButton>
                    <IonSegmentButton value="inbox">
                        <span className={segment == "inbox"?"seq-title":"seq-title-2"}><IonLabel color="dark">Inbox {
                            inbox && inbox.length>0 && <IonBadge color="danger">{inbox && inbox.length}</IonBadge>
                        }</IonLabel></span>
                    </IonSegmentButton>
                </IonSegment>
                {
                    segment == "balance" && <div>
                        {
                            factors && factors.length>0 ? <>
                                {/*<IonItem>*/}
                                {/*    <IonLabel>*/}
                                {/*        Token*/}
                                {/*    </IonLabel>*/}
                                {/*    <IonLabel color="primary" slot="end">Balance</IonLabel>*/}
                                {/*</IonItem>*/}
                                {
                                    factors && factors.map((v,i)=>{
                                        return <div key={i} >
                                            <FactorItem factor={v} showLine hideDetail={true}/>
                                        </div>
                                    })
                                }
                            </>:<>
                                <NoneData/>
                            </>
                        }
                    </div>
                }
                {
                    segment == "inbox" &&  <div>
                        {
                            inbox && inbox.length>0 ? <>
                                {
                                    (inbox as Array<SettleResp>).map((v,i)=>{
                                        return <div key={i} >
                                            <InboxList key={i} item={v} onReceive={stl=>{
                                                setShowLoading(true)
                                                receive([stl]).then(()=>{
                                                    setTimeout(()=>{
                                                        setShowLoading(false)
                                                        present({message: "Receive successfully!", color: "primary", duration: 2000, position: "top"})
                                                        init().catch(e=>{
                                                            console.error(e)
                                                        })
                                                    },3 * 1000)
                                                }).catch(e=>{
                                                    setShowLoading(false)
                                                    const err = typeof e == 'string'?e: e.message;
                                                    present({message: err, color: "danger", duration: 2000, position: "top"})
                                                })
                                            }}/>
                                        </div>
                                    })
                                }
                            </>:<>
                                <NoneData/>
                            </>
                        }
                    </div>
                }
                <IonLoading
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    onDidDismiss={() => setShowLoading(false)}
                    message={'Please wait...'}
                    duration={60000}
                />
            </IonContent>
        </IonModal>
    </>;
}