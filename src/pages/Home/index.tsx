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
    IonTitle,
    IonMenu,
    IonMenuToggle, IonLoading
} from "@ionic/react";
import {tribeService} from "../../service/tribe";
import {TribeInfo} from "../../types";
import './index.scss';
import {SideBar} from "../../components/ChatRoom/SideBar";
import {ChainType, SettleResp} from "@emit-technology/emit-lib";
import {emitBoxSdk} from "../../service/emitBox";
import {TribeLayout} from "../../components/Tribe/TribeLayout";
import selfStorage from "../../common/storage";
import {TribeEditModal} from "../../components/Tribe";
import {utils} from "../../common";
import {TribeDetail} from "../../components/Tribe/TribeDetail";
import config from "../../common/config";
import {useLayoutEffect, useState} from "react";
import {saveDataState} from "../../common/state/slice/dataSlice";
import walletWorker from "../../worker/walletWorker";
import {useAppDispatch} from "../../common/state/app/hooks";

interface Props {
    router: any;
    nokiId?: string;
    nokiReward?: string;
    opType?: string;
}

export const HomePage:React.FC<Props> = ({router, nokiReward, nokiId, opType}) =>{

    const [segment , setSegment] = useState("forYou");
    const [data, setData] = useState([]); //Array<TribeInfo>
    const [dataOrigin, setDataOrigin] = useState([]);
    const [account, setAccount] = useState(null);
    const [isSessionAvailable, setIsSessionAvailable] = useState(false);
    const [layout,setLayout] = useState([]);
    const [showLoading, setShowLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [tribeTimeMap, setTribeTimeMap] = useState(new Map<string, number>());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [tribeUserInfo, setTribeUserInfo] = useState(null);

    const [address, setAddress] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [inboxNum, setInboxNum] = useState(0);
    const [showTribeDetail, setShowTribeDetail] = useState(false);
    const [selectTribeId, setSelectTribeId] = useState("");

    useLayoutEffect(()=>{
        setShowLoading(true)
        init().then(() => {
            setShowLoading(false)
        }).catch(e => {
            setShowLoading(false)
            console.log(e)
        });


        if (document.hidden !== undefined) {
            document.addEventListener('visibilitychange', () => {
                try {
                    if (!document.hidden) {
                        console.log("init... ")
                        init().catch(e => console.error(e))
                    }
                } catch (e) {
                    console.error(JSON.stringify(e))
                }
            })
        }
    },[])


    const init = async (seqmt?: string) => {
        try {
            if (!seqmt) {
                seqmt = segment;
            }
            let data: Array<TribeInfo> = [];
            if (seqmt == 'forYou') {
                const rest = selfStorage.getItem("involvedTribes"); //await tribeService.involvedTribes();
                if (rest) {
                    data = [...rest]
                    tribeService.involvedTribes().then(data => {
                        setData(data);
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
                       setData(data)
                    })
                } else {
                    const res = await tribeService.myTribes();
                    data = [...res]
                }
            }
            const account = await emitBoxSdk.getAccount();
            const f = await tribeService.isSessionAvailable()

            await fetchInboxNum();
            await initTimeMap(data);

            setData(data);
            setAddress(account && account.addresses[ChainType.EMIT])
            setDataOrigin(data);
            setAccount(account);
            setIsSessionAvailable(f);

        } catch (e) {
            setTimeout(() => {
                init(seqmt)
            }, 500)
        }

    }

    const initTimeMap = (data: Array<TribeInfo>) => {
        const timeMap: Map<string, number> = new Map<string, number>();
        for (let d of data) {
            if (d.latestMsg) {
                const time = selfStorage.getItem(`latest_view_${d.tribeId}`)
                if (time) {
                    timeMap.set(d.tribeId, time)
                }
            }
        }
        setTribeTimeMap(timeMap);
    }

    const fetchInboxNum = async () => {
        const account = await emitBoxSdk.getAccount();
        if (account && account.addresses) {
            emitBoxSdk.emitBox.emitDataNode.getUnSettles(account.addresses[ChainType.EMIT]).then((inbox: Array<SettleResp>) => {
                if (inbox) {
                   setInboxNum(inbox.length)
                }
            })
        }
    }

    const searchTextFn = (value: string) => {
        if (!value) {
            setData(dataOrigin)
            setSearchText(value);
        } else {
            const data = dataOrigin.filter(v => (v.title.toLowerCase().indexOf(value.toLowerCase()) > -1 || v.tribeId.toLowerCase().indexOf(value.toLowerCase()) > -1))
            setData(data)
            setSearchText(value);
            if (!data || data.length == 0) {
                try {
                    const tribeId = utils.getTribeIdFromUrl(value)
                    if (tribeId && tribeId.length >= 11) {
                        tribeService.tribeInfo(tribeId).then(tribeInfo => {
                            tribeInfo.latestMsg = null;
                            tribeInfo.roles = [];
                            tribeInfo.subscribed = false;
                            setData( [tribeInfo])
                            setSearchText(value);
                        }).catch(e => console.log(e))
                    }
                } catch (e) {
                    console.error(e)
                }

            }
        }
    }

    const dispatch = useAppDispatch();

    const checkRequestAccount = async ()=>{
        let flag = false;
        const isAvailable = await tribeService.isSessionAvailable();
        if(!isAvailable){
            const isLock = await walletWorker.isLocked();
            if (isLock) {
                flag = true;
            }
            if(flag){
                dispatch(saveDataState({
                    tag: 'requestAccount',
                    data: Date.now()
                }))
                return Promise.reject("Account not login");
            }else{
                const accounts = await walletWorker.accounts();
                if(accounts && accounts.length>0){
                    await tribeService.accountLogin(accounts[0])
                    init().catch(e=>console.error(e))
                }else{
                    dispatch(saveDataState({
                        tag: 'requestAccount',
                        data: Date.now()
                    }))
                    return Promise.reject("Account not exist");
                }
            }
            return Promise.resolve(true)
        }
        return Promise.resolve(true)
    }

    return <>
        <IonMenu contentId="main-home" swipeGesture={false} onIonDidOpen={() => {
            fetchInboxNum().catch(e=>console.error(e))
        }}>
            <IonHeader>
                <IonToolbar className="msg-toolbar">
                    <IonMenuToggle>
                        <div style={{paddingLeft: 12}} id="toggleBtn">
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
                <SideBar inboxNumber={inboxNum} router={router}
                         opType={opType}
                         nokiReward={nokiReward}
                         nokiId={nokiId}
                         onRequestAccount={() => {
                             init().catch(e => {
                                 console.error(e)
                             })
                         }} account={account} onLogout={() => {
                    tribeService.userLogout().then(() => {
                        init().catch(e => {
                            // const err = typeof e == 'string' ? e : e.message;
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
                           setShowSearch(true)
                        }}>
                            <img src="./assets/img/icon/searchOutline.png" style={{height: 24}}/>
                        </IonButton>

                        <IonButton onClick={() => {
                            setShowLoading(true)
                            checkRequestAccount().then(()=>{
                                setShowLoading(false)
                                setShowCreateModal(true)
                            }).catch(e=>{
                                setShowLoading(false)
                            })
                        }}>
                            <img src="./assets/img/icon/addOutline.png" style={{height: 24}}/>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="home-ctn ion-content-chat padding-top-0">
                <IonSegment className="segment" color="secondary" mode="md" value={segment} onIonChange={(e) => {
                    setShowLoading(true)
                    setSegment(e.detail.value);
                    init(e.detail.value).then(() => {
                        setShowLoading(false)
                    }).catch(e => {
                        setShowLoading(false)
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
                    setShowSearch(false);
                }}>
                    <IonSearchbar value={searchText} onIonBlur={() => {
                        setShowSearch(false);
                    }} showClearButton="focus" id="search-input" placeholder="Search"
                                  onIonChange={(e) => {
                                      searchTextFn(e.detail.value)
                                  }}
                    />
                </IonModal>

                <div style={{height: "calc(100% - 48px)", padding: "0 12px 20px", overflow: "scroll"}}>
                    <TribeLayout onSelectTribe={(tribeId) => {
                        if(!!tribeId){
                            config.tribeId = tribeId;
                            setShowTribeDetail(true)
                            setSelectTribeId(tribeId);
                        }else{
                            setShowTribeDetail(false);
                            init().catch(e => console.error(e))
                        }
                    }} onReload={() => {
                        init().catch(e => console.error(e))
                    }} address={address} tribeUserInfo={tribeUserInfo} data={data} tribeTimeMap={tribeTimeMap}/>
                </div>

                {/*<IonToast*/}
                {/*    isOpen={showToast}*/}
                {/*    onDidDismiss={() => setShowToast(false)}*/}
                {/*    message={toastMsg}*/}
                {/*    duration={2000}*/}
                {/*    position="top"*/}
                {/*    color="danger"*/}
                {/*/>*/}

                <TribeEditModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}
                                onOk={(tribeId) => {
                                    setShowCreateModal(false);
                                    utils.goTo(tribeId)
                                }}/>

            </IonContent>

            <IonLoading
                cssClass='my-custom-class'
                isOpen={showLoading}
                onDidDismiss={() => setShowLoading(false)}
                message={'Loading...'}
                duration={60000}
            />

        </IonPage>
        <TribeDetail tribeId={selectTribeId} isOpen={showTribeDetail}
                     onClose={() => setShowTribeDetail(false)}/>
    </>
}