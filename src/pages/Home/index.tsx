import * as React from 'react';
import {
    IonHeader,
    IonModal,
    IonButton,
    IonPage,
    IonSearchbar,
    IonContent,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonButtons,
    IonText,
    IonToast,
    IonTitle,
    IonMenu,
    IonMenuToggle
} from "@ionic/react";
import {tribeService} from "../../service/tribe";
import {TribeInfo} from "../../types";
import './index.scss';
import {SideBar} from "../../components/ChatRoom/SideBar";
import {AccountModel, ChainType, SettleResp} from "@emit-technology/emit-lib";
import {emitBoxSdk} from "../../service/emitBox";
import {TribeLayout} from "../../components/Tribe/TribeLayout";
import selfStorage from "../../common/storage";
import {TribeEditModal} from "../../components/Tribe";
import {utils} from "../../common";
import {TribeDetail} from "../../components/Tribe/TribeDetail";
import config from "../../common/config";

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
    tribeTimeMap: Map<string, number>;
    showCreateModal: boolean
    tribeUserInfo: any;
    address: string
    showSearch: boolean
    searchText: string;
    inboxNum: number
    showTribeDetail: boolean;
    selectTribeId?: string
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
        tribeTimeMap: new Map<string, number>(),
        showCreateModal: false,
        tribeUserInfo: null,
        address: "",
        showSearch: false,
        searchText: "",
        inboxNum: 0,
        showTribeDetail: false,
        selectTribeId: ""
    }

    componentDidMount() {

        this.setShowLoading(true)
        this.init().then(() => {
            this.setShowLoading(false)
        }).catch(e => {
            this.setShowLoading(false)
            console.log(e)
        });


        if (document.hidden !== undefined) {
            document.addEventListener('visibilitychange', () => {
                try {
                    if (!document.hidden) {
                        console.log("init... ")
                        this.init().catch(e => console.error(e))
                    }
                } catch (e) {
                    console.error(JSON.stringify(e))
                }
            })
        }
    }

    init = async (seqmt?: string) => {
        try {
            if (!seqmt) {
                const {segment} = this.state;
                seqmt = segment;
            }
            let data: Array<TribeInfo> = [];
            if (seqmt == 'forYou') {
                const rest = selfStorage.getItem("involvedTribes"); //await tribeService.involvedTribes();
                if (rest) {
                    data = [...rest]
                    tribeService.involvedTribes().then(data => {
                        this.setState({data: data})
                    })
                } else {
                    const res = await tribeService.involvedTribes();
                    data = [...res]
                }
            } else if (seqmt == 'myVerse') {
                const rest = selfStorage.getItem("myTribes"); //await tribeService.myTribes();
                if (rest) {
                    data = [...rest]
                    tribeService.myTribes().then(data => {
                        this.setState({data: data})
                    })
                } else {
                    const res = await tribeService.myTribes();
                    data = [...res]
                }
            }

            //TODO fot test
            // data = [...data,...(data.reverse()),...(data.reverse()),...data,...(data.reverse()),]

            const account = await emitBoxSdk.getAccount();
            const f = await tribeService.isSessionAvailable()
            // const tribeUserInfo = await tribeService.tribeUserInfo();

            await this.fetchInboxNum();
            await this.initTimeMap(data);
            this.setState({
                data: data,
                address: account && account.addresses[ChainType.EMIT],
                dataOrigin: data,
                account: account,
                isSessionAvailable: f
            })
        } catch (e) {
            setTimeout(() => {
                this.init(seqmt)
            }, 500)
        }

    }

    initTimeMap = (data: Array<TribeInfo>) => {
        const timeMap: Map<string, number> = new Map<string, number>();
        for (let d of data) {
            if (d.latestMsg) {
                const time = selfStorage.getItem(`latest_view_${d.tribeId}`)
                if (time) {
                    timeMap.set(d.tribeId, time)
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
        const {dataOrigin, segment} = this.state;
        if (!value) {
            this.setState({data: dataOrigin, searchText: value})
        } else {
            const data = dataOrigin.filter(v => (v.title.toLowerCase().indexOf(value.toLowerCase()) > -1 || v.tribeId.toLowerCase().indexOf(value.toLowerCase()) > -1))
            this.setState({data: data, searchText: value})
            if (!data || data.length == 0) {
                try {
                    const tribeId = utils.getTribeIdFromUrl(value)
                    if (tribeId && tribeId.length >= 11) {
                        tribeService.tribeInfo(tribeId).then(tribeInfo => {
                            tribeInfo.latestMsg = null;
                            tribeInfo.roles = [];
                            tribeInfo.subscribed = false;

                            this.setState({data: [tribeInfo], searchText: value})
                        }).catch(e => console.log(e))
                    }
                } catch (e) {
                    console.error(e)
                }

            }
        }
    }

    setShowCreateModal = (f: boolean) => {
        this.setState({showCreateModal: f})
    }

    fetchInboxNum = async () => {
        const account = await emitBoxSdk.getAccount();
        if (account && account.addresses) {
            emitBoxSdk.emitBox.emitDataNode.getUnSettles(account.addresses[ChainType.EMIT]).then((inbox: Array<SettleResp>) => {
                if (inbox) {
                    this.setState({
                        inboxNum: inbox.length
                    })
                }
            })
        }
    }

    render() {
        const {segment, account, tribeUserInfo, showSearch, searchText,
            inboxNum, address, isSessionAvailable, showCreateModal,
            tribeTimeMap, data, layout, showLoading, showToast, toastMsg,
            selectTribeId, showTribeDetail
        } = this.state;

        return <>
            <IonMenu contentId="main-home" swipeGesture={false}      onIonDidOpen={() => {
                this.fetchInboxNum()
            }}>
                <IonHeader>
                    <IonToolbar className="msg-toolbar">
                        <IonMenuToggle>
                            <div style={{paddingLeft: 12}}>
                                <img src="./assets/img/icon/backOutline.png" height={24}/>
                            </div>
                        </IonMenuToggle>
                        <IonTitle>
                            <img height={30} src="./assets/img/pins-logo.png"/>
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-content-chat">
                    {/*<IonMenuToggle>*/}
                    {/*    <IonButton>Click to close the menu</IonButton>*/}
                    {/*</IonMenuToggle>*/}
                    <SideBar inboxNum={inboxNum} router={this.props.router} onRequestAccount={() => {
                        this.init().catch(e => {
                            // const err = typeof e == 'string' ? e : e.message;
                            // this.setShowToast(true, err)
                            // console.error(e)
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
            {/*className="main-home-page" style={showTribeDetail?{transform: "translateX(-80px)"}:{transform:"translateX(0px)"}}*/}
            <IonPage id="main-home">
                <IonHeader style={{background: "#fff"}} >
                    <IonToolbar className="msg-toolbar">
                        <div slot="start" id="main-home" className="msg-head-avatar">
                            <IonMenuToggle>
                                {/*<IonIcon src={listOutline} size="large"/>*/}
                                <img src="./assets/img/icon/menuOutline.png" height={24}/>
                            </IonMenuToggle>
                        </div>

                        <IonTitle>
                            <div className="home-head-title">
                                <div className="home-head-ctn">
                                    <div style={{height: 26, borderRadius: 6}} slot={"start"}>
                                        <img src="./assets/img/pins-logo.png" height='24px'/>
                                    </div>
                                    {/*<div style={{fontSize: '20px',fontFamily:"SFBold",paddingLeft: 2}}>*/}
                                    {/*   Verse*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                        </IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => {
                                this.setState({showSearch: true})
                            }}>
                                <img src="./assets/img/icon/searchOutline.png" style={{height: 24}}/>
                            </IonButton>

                            <IonButton onClick={() => {
                                this.setState({showCreateModal: true})
                            }}>
                                <img src="./assets/img/icon/addOutline.png" style={{height: 24}}/>
                            </IonButton>
                        </IonButtons>
                        {/*<IonPopover trigger="hover-trigger" triggerAction="click">*/}
                        {/*        <IonSearchbar placeholder="Input keyword"/>*/}
                        {/*</IonPopover>*/}
                        {/*<IonModal trigger="open-custom-dialog" className="searchbar-modal" canDismiss>*/}
                        {/*    <IonSearchbar showClearButton="focus" id="search-input" placeholder="Input keyword"*/}
                        {/*                  onIonChange={(e) => {*/}
                        {/*                      this.searchText(e.detail.value)*/}
                        {/*                  }}/>*/}
                        {/*</IonModal>*/}

                    </IonToolbar>
                </IonHeader>
                <IonContent className="home-ctn ion-content-chat padding-top-0">
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
                            <span className={segment == "forYou" ? "seq-title" : "seq-title-2"}><IonText color="dark">For You</IonText></span>
                        </IonSegmentButton>
                        <IonSegmentButton color="dark" className="segment-button" value="myVerse">
                            <span className={segment == "myVerse" ? "seq-title" : "seq-title-2"}><IonText color="dark">My Verse</IonText></span>
                        </IonSegmentButton>
                        {/*<IonSegmentButton color="dark" className="segment-button" value="recentView">Recent View</IonSegmentButton>*/}
                    </IonSegment>

                    <IonModal isOpen={showSearch} className="searchbar-modal" onDidDismiss={(e) => {
                        this.setState({showSearch: false})
                    }}>
                        <IonSearchbar value={searchText} onIonBlur={() => {
                            this.setState({showSearch: false})
                        }} showClearButton="focus" id="search-input" placeholder="Search"
                                      onIonChange={(e) => {
                                          this.searchText(e.detail.value)
                                      }}
                        />
                    </IonModal>


                    {/*<IonRow>*/}
                    {/*    <IonCol offsetLg="3" sizeLg="6" offsetSm="1" sizeSm="10">*/}
                    {/*        <IonSearchbar  showClearButton="focus" id="search-input" placeholder="Search"*/}
                    {/*                      onIonChange={(e) => {*/}
                    {/*                          this.searchText(e.detail.value)*/}
                    {/*                      }}*/}
                    {/*                      // onIonCancel={(e) => {*/}
                    {/*                      //     const value = e.target.value;*/}
                    {/*                      //     if(value && value.indexOf("https://pins.emit.technology/") > -1){*/}
                    {/*                      //         const tribeId = value.slice("https://pins.emit.technology/".length)*/}
                    {/*                      //         window.location.href = `./${tribeId}`*/}
                    {/*                      //     }else{*/}
                    {/*                      //         this.searchText(e.target.value)*/}
                    {/*                      //     }*/}
                    {/*                      // }}*/}
                    {/*        />*/}
                    {/*    </IonCol>*/}
                    {/*</IonRow>*/}
                    <div style={{height: "calc(100% - 48px)", padding: "0 12px 20px", overflow: "scroll"}}>
                        {/*{*/}
                        {/*    layout && layout.length>0&&<TribeRecommend data={data} layout={layout}/>*/}
                        {/*}*/}
                        <TribeLayout onSelectTribe={(tribeId) => {
                            if(!!tribeId){
                                config.tribeId = tribeId;
                                this.setState({showTribeDetail:true, selectTribeId: tribeId})
                            }else{
                                this.setState({showTribeDetail:false})
                                this.init().catch(e => console.error(e))
                            }
                        }} onReload={() => {
                            this.init().catch(e => console.error(e))
                        }} address={address} tribeUserInfo={tribeUserInfo} data={data} tribeTimeMap={tribeTimeMap}/>
                    </div>

                    {/*<IonLoading*/}
                    {/*    cssClass='my-custom-class'*/}
                    {/*    isOpen={showLoading}*/}
                    {/*    onDidDismiss={() => this.setShowLoading(false)}*/}
                    {/*    message={'Loading...'}*/}
                    {/*    duration={60000}*/}
                    {/*/>*/}

                    <IonToast
                        isOpen={showToast}
                        onDidDismiss={() => this.setShowToast(false)}
                        message={toastMsg}
                        duration={2000}
                        position="top"
                        color="danger"
                    />

                    <TribeEditModal isOpen={showCreateModal} onClose={() => this.setShowCreateModal(false)}
                                    onOk={(tribeId) => {
                                        this.setShowCreateModal(false);
                                        utils.goTo(tribeId)
                                    }}/>

                </IonContent>



            </IonPage>
            <TribeDetail tribeId={selectTribeId} isOpen={showTribeDetail}
                         onClose={() => this.setState({showTribeDetail:false})}/>
        </>;
    }
}