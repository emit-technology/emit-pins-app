import * as React from 'react';
import {
    IonHeader, IonModal,IonButton, IonPage, IonSearchbar, IonContent, IonToolbar, IonSegment, IonLabel, IonSegmentButton, IonItem,
    IonButtons, IonIcon,IonRow,IonCol,IonText, IonToast, IonTitle, IonLoading, IonMenu, IonMenuToggle
} from "@ionic/react";
import {addOutline, arrowBackOutline, listOutline, personCircleOutline, searchOutline} from "ionicons/icons";
import {tribeService} from "../../service/tribe";
import {TribeInfo} from "../../types";
import './index.scss';
import {SideBar} from "../../components/ChatRoom/SideBar";
import {AccountModel} from "@emit-technology/emit-lib";
import {emitBoxSdk} from "../../service/emitBox";
import {TribeLayout} from "../../components/Tribe/TribeLayout";
import selfStorage from "../../common/storage";
import {TribeEditModal} from "../../components/Tribe";

interface State {
    segment: string
    data: Array<TribeInfo>,
    dataOrigin: Array<TribeInfo>,
    account?: AccountModel,
    isSessionAvailable: boolean,
    layout: Array<any>;
    showLoading: boolean
    showToast: boolean;
    toastMsg?: string
    tribeTimeMap: Map<string,number>;
    showCreateModal: boolean
}

interface Props {
    router: any;
}

export class HomePage extends React.Component<Props, State> {

    state: State = {
        segment: 'forYou',
        data: [],
        dataOrigin: [],
        isSessionAvailable: false,
        layout: [],
        showLoading: false,
        showToast: false,
        toastMsg: "",
        tribeTimeMap: new Map<string,number>() ,
        showCreateModal: false
    }

    componentDidMount() {

        this.setShowLoading(true)
        this.init().then(() => {
            this.setShowLoading(false)
        }).catch(e => {
            this.setShowLoading(false)
            console.log(e)
        });
    }

    init = async (seqmt?: string) => {
        if (!seqmt) {
            const {segment} = this.state;
            seqmt = segment;
        }
        let data: Array<TribeInfo> = [];
        if (seqmt == 'forYou') {
            const rest = await tribeService.involvedTribes();
            if (rest) {
                data = [...rest]
            }
        } else if (seqmt == 'myVerse') {
            const rest = await tribeService.myTribes();
            if (rest) {
                data = [...rest]
            }
        }

        //TODO fot test
        // data = [...data,...(data.reverse()),...(data.reverse()),...data,...(data.reverse()),]

        const account = await emitBoxSdk.getAccount();
        const f = await tribeService.isSessionAvailable()

        await this.initTimeMap(data);
        this.setState({data: data, dataOrigin: data, account: account, isSessionAvailable: f})

    }

    initTimeMap = (data:Array<TribeInfo>) =>{
        const timeMap:Map<string,number> = new Map<string,number>();
        for(let d of data){
            if(d.latestMsg){
                const time = selfStorage.getItem(`latest_view_${d.tribeId}`)
                if(time){
                    timeMap.set(d.tribeId,time)
                }
            }
        }
        this.setState({tribeTimeMap: timeMap})
    }

    setShowLoading = (f: boolean) => {
        this.setState({showLoading: f})
    }

    setShowToast = (f: boolean, msg?: string) => {
        this.setState({showToast: f, toastMsg: msg})
    }

    searchText = (value: string) => {
        const {dataOrigin} = this.state;
        if (!value) {
            this.setState({data: dataOrigin})
        } else {
            const data = dataOrigin.filter(v => (v.title.toLowerCase().indexOf(value.toLowerCase()) > -1 || v.tribeId.toLowerCase().indexOf(value.toLowerCase()) > -1))
            this.setState({data: data})
        }
    }

    setShowCreateModal = (f:boolean) =>{
        this.setState({showCreateModal: f})
    }
    render() {
        const {segment, account, isSessionAvailable, showCreateModal ,tribeTimeMap, data, layout, showLoading, showToast, toastMsg} = this.state;
        return <>
            <IonMenu contentId="main-home">
                <IonHeader>
                    <IonToolbar className="msg-toolbar">
                        <IonMenuToggle>
                            <div style={{paddingLeft: 12}}><IonIcon src={arrowBackOutline}/></div>
                        </IonMenuToggle>
                        <IonTitle>
                            <img height={28} src="./assets/img/pins-logo.png"/>
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    {/*<IonMenuToggle>*/}
                    {/*    <IonButton>Click to close the menu</IonButton>*/}
                    {/*</IonMenuToggle>*/}
                    <SideBar router={this.props.router} onRequestAccount={() => {
                        this.init().catch(e => {
                            const err = typeof e == 'string' ? e : e.message;
                            this.setShowToast(true, err)
                            console.error(e)
                        })
                    }} account={account} onLogout={() => {
                        tribeService.userLogout().then(() => {
                            this.init().catch(e => {
                                const err = typeof e == 'string' ? e : e.message;
                                this.setShowToast(true, err)
                                console.error(e)
                            })
                        })
                    }} isSessionAvailable={isSessionAvailable}/>
                </IonContent>
            </IonMenu>
            <IonPage id="main-home">
                <IonHeader mode="ios" color="primary" style={{padding: '0 12px', background: "#ffffff"}}>
                    <IonToolbar className="msg-toolbar">
                        <div slot="start" id="main-home">
                            <IonMenuToggle>
                                <IonIcon src={listOutline} size="large"/>
                            </IonMenuToggle>
                        </div>
                        <IonTitle>
                            <div className="home-head-title">
                                <div className="home-head-ctn">
                                    <div style={{height: 32,borderRadius: 6}} slot={"start"}>
                                        <img src="./assets/img/pins-logo.png" height='100%'/>
                                    </div>
                                    {/*<div style={{fontSize: '20px',fontFamily:"SFBold",paddingLeft: 2}}>*/}
                                    {/*   Verse*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                        </IonTitle>

                        <IonButtons slot="end">
                            <IonButton onClick={()=>{
                                this.setState({showCreateModal: true})
                            }}><IonIcon src={addOutline} id="open-custom-dialog" size="large" color="dark"/></IonButton>
                        </IonButtons>
                        {/*<IonPopover trigger="hover-trigger" triggerAction="click">*/}
                        {/*        <IonSearchbar placeholder="Input keyword"/>*/}
                        {/*</IonPopover>*/}
                        {/*<IonModal trigger="open-custom-dialog" className="searchbar-modal">*/}
                        {/*    <IonSearchbar showClearButton="focus" id="search-input" placeholder="Input keyword"*/}
                        {/*                  onIonChange={(e) => {*/}
                        {/*                      this.searchText(e.detail.value)*/}
                        {/*                  }}/>*/}
                        {/*</IonModal>*/}

                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen className="ion-padding home-ctn">
                    <IonSegment className="segment" color="secondary" mode="md" value={segment} onIonChange={(e) => {
                        this.setState({showLoading: true, segment: e.detail.value})
                        this.init(e.detail.value).then(() => {
                            this.setShowLoading(false)
                        }).catch(e => {
                            this.setShowLoading(false)
                            console.error(e)
                        });
                    }}>
                        <IonSegmentButton color="dark" className="segment-button" value="forYou">
                            <span className={segment == "forYou"?"seq-title":"seq-title-2"}><IonText color="dark">For You</IonText></span>
                        </IonSegmentButton>
                        <IonSegmentButton color="dark" className="segment-button" value="myVerse">
                            <span className={segment == "myVerse"?"seq-title":"seq-title-2"}><IonText color="dark">My Verse</IonText></span>
                        </IonSegmentButton>
                        {/*<IonSegmentButton color="dark" className="segment-button" value="recentView">Recent View</IonSegmentButton>*/}
                    </IonSegment>
                    <IonRow>
                        <IonCol offsetLg="3" sizeLg="6" offsetSm="1" sizeSm="10">
                            <IonSearchbar showClearButton="focus" id="search-input" placeholder="Search"
                                          onIonChange={(e) => {
                                              this.searchText(e.detail.value)
                                          }}/>
                        </IonCol>
                    </IonRow>
                    <div>
                        {/*{*/}
                        {/*    layout && layout.length>0&&<TribeRecommend data={data} layout={layout}/>*/}
                        {/*}*/}
                        <TribeLayout data={data} tribeTimeMap={tribeTimeMap}/>
                    </div>

                    <IonLoading
                        cssClass='my-custom-class'
                        isOpen={showLoading}
                        onDidDismiss={() => this.setShowLoading(false)}
                        message={'Loading...'}
                        duration={60000}
                    />

                    <IonToast
                        isOpen={showToast}
                        onDidDismiss={() => this.setShowToast(false)}
                        message={toastMsg}
                        duration={2000}
                        position="top"
                        color="danger"
                    />

                    <TribeEditModal isOpen={showCreateModal} onClose={()=>this.setShowCreateModal(false)} onOk={(tribeId)=>{
                        this.setShowCreateModal(false);
                        window.location.href = `/${tribeId}`;
                    }} />

                </IonContent>
            </IonPage>

        </>;
    }
}