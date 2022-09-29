import * as React from 'react';
import {Message, TribeRole} from "../../../../../types";
import {IonText, IonItem, IonAvatar, IonLabel, IonCheckbox, IonIcon} from "@ionic/react";
import {utils} from "../../../../../common";
import {chevronForwardOutline} from "ionicons/icons";
import {PhotoProvider, PhotoView} from "react-photo-view";
import {useState} from "react";

interface Props{
    msg: Message;
    showPin: boolean
    isOwner?: boolean;
}

export const Role:React.FC<Props> = ({msg,isOwner}) =>{

    const content:TribeRole = msg.content as TribeRole
    const [showOrigin,setShowOrigin] = useState(false)
    return <>

        {
            content && <div className="msg-receive2" key={msg.id}>
                <div className="box" style={{flexDirection: 'row',
                    justifyContent: 'center'}}>
                    <div style={{display:"flex"}}>
                        {/*{*/}
                        {/*    showPin && <div className="pin-check">*/}
                        {/*        <IonCheckbox name="pinMsgId" value={msg.id}/>*/}
                        {/*    </div>*/}
                        {/*}*/}
                        <div style={{maxWidth: '300px'}}>
                            <div style={{padding: '6px 12px',textAlign:"center"}}>
                                <b style={{fontSize: '12px'}}>{content.op && content.op =='add'?"New role":"Update role"}</b>  <span style={{fontSize: '11px'}}>
                                <IonText color="medium">{utils.dateFormat(new Date(msg.timestamp * 1000))}</IonText>
                            </span>
                            </div>
                            <div className="update-role">


                                {
                                    showOrigin && content.origin && <div style={{position: "relative"}}>
                                        <div className="origin">old</div>
                                        <div onClick={()=>{
                                            setShowOrigin(false);
                                        }}>
                                            {/*<IonItem lines="none" color="tertiary" style={{borderRadius:12,border: "1px solid #ddd"}} >*/}
                                            {/*    <IonAvatar slot="start">*/}
                                            {/*        {*/}
                                            {/*            content.origin && content.origin.avatar && <PhotoProvider maskOpacity={0.8}>*/}
                                            {/*                <PhotoView src={utils.getDisPlayUrl(content.origin.avatar)}>*/}
                                            {/*                    <img src= {utils.getDisPlayUrl(content.origin.avatar)}/>*/}
                                            {/*                </PhotoView>*/}
                                            {/*            </PhotoProvider>*/}
                                            {/*        }*/}
                                            {/*    </IonAvatar>*/}
                                            {/*    <IonLabel className="ion-text-nowrap">*/}
                                            {/*        <b>{content.origin.name}</b>*/}
                                            {/*        <p><IonText>{content.origin.desc}</IonText></p>*/}
                                            {/*    </IonLabel>*/}
                                            {/*</IonItem>*/}
                                            <div style={{borderRadius:12,display:"flex",border: "1px solid #ddd", background:'var(--ion-color-tertiary)',padding: '6px 12px'}}>
                                               <div style={{  display: 'flex',
                                                   flexDirection: 'column',
                                                   justifyContent: 'center'}}>
                                                   <div>
                                                       <IonAvatar slot="start" className="ion-avatar2">
                                                           {
                                                               content.origin && content.origin.avatar && <PhotoProvider maskOpacity={0.8}>
                                                                   <PhotoView src={utils.getDisPlayUrl(content.origin.avatar)}>
                                                                       <img src= {utils.getDisPlayUrl(content.origin.avatar)}  width={36} height={36}/>
                                                                   </PhotoView>
                                                               </PhotoProvider>
                                                           }
                                                       </IonAvatar>
                                                   </div>
                                               </div>
                                                <div style={{padding: "0 0 0 6px",    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'}} >
                                                    <div><b>{content.origin.name}</b></div>
                                                    <div><IonText>{content.origin.desc}</IonText></div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                }

                                {
                                    !showOrigin && <div style={{position: "relative"}} onClick={()=>{
                                        if(content.origin){
                                            setShowOrigin(true)
                                        }
                                    }}>
                                        { content.origin && <div className="origin-to">new</div>}

                                        <div style={{borderRadius:12,display:"flex",border: isOwner?"1px solid #D8F20C":"0", background:'var(--ion-color-tertiary)',padding: '6px 12px'}} >
                                            <div  style={{  display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'}}>
                                                <div>
                                                    <IonAvatar slot="start" className="ion-avatar2">
                                                        {
                                                            content && content.avatar && <PhotoProvider maskOpacity={0.8}>
                                                                <PhotoView src={utils.getDisPlayUrl(content.avatar)}>
                                                                    <img src= {utils.getDisPlayUrl(content.avatar)} width={36} height={36}/>
                                                                </PhotoView>
                                                            </PhotoProvider>
                                                        }
                                                    </IonAvatar>
                                                </div>
                                            </div>
                                            <div style={{padding: "0 0 0 6px" ,  display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'}} >
                                                <div><b>{content.name}</b></div>
                                                <div><IonText>{content.desc}</IonText></div>
                                            </div>
                                        </div>

                                        {/*<IonItem lines="none" color="tertiary" style={{borderRadius:12,border: isOwner?"1px solid #D8F20C":"0"}} >*/}
                                        {/*    <IonAvatar slot="start">*/}
                                        {/*        {*/}
                                        {/*            content && content.avatar && <PhotoProvider maskOpacity={0.8}>*/}
                                        {/*                <PhotoView src={utils.getDisPlayUrl(content.avatar)}>*/}
                                        {/*                    <img src= {utils.getDisPlayUrl(content.avatar)}/>*/}
                                        {/*                </PhotoView>*/}
                                        {/*            </PhotoProvider>*/}
                                        {/*        }*/}
                                        {/*    </IonAvatar>*/}
                                        {/*    <IonLabel className="ion-text-nowrap">*/}
                                        {/*        <b>{content.name}</b>*/}
                                        {/*        <p><IonText>{content.desc}</IonText></p>*/}
                                        {/*    </IonLabel>*/}
                                        {/*</IonItem>*/}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }

    </>

}