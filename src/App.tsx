import {Redirect, Route, Switch, BrowserRouter as Router} from 'react-router-dom';
import {
    createGesture,
    Gesture,
    IonApp, IonContent, IonHeader, IonIcon, IonMenu, IonTitle, IonToolbar,
    setupIonicReact, useIonRouter
} from '@ionic/react';
// import {IonReactHashRouter as Router} from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './App.scss';
import React, {useEffect, useRef, useState} from "react";
import config from "./common/config";
import {Provider} from "react-redux";
import store from "./common/state/app/store";
import {HomePage} from "./pages/Home";
import {DashboardV2} from "./pages/Dashboard/index2";
import {App as AppPin} from '@capacitor/app';
import {utils} from "./common";
import {Toast} from "@capacitor/toast";
import {CatPage} from "./pages/Cat";

setupIonicReact({
    mode: "ios",
});


let init_count = 0;
let lastTime = 0;
const App: React.FC = () => {
    // const [roles,setRoles] = React.useState([]);
    // const [tribeInfo,setTribeInfo,]

    // const [showTip,setShowTip ] = useState(true);
    //
    // useEffect(()=>{
    //     const readTip = selfStorage.getItem("readTip");
    //     setShowTip(!readTip)
    // },[])
    // const mobileWidth = document.documentElement.clientWidth <=768;
    // const Tip = ()=>  mobileWidth?<img src="./assets/img/snaptip2.png" style={{height:'100%', width:'100%'}}/>:<img src="./assets/img/snaptip.png"  style={{height:'100%', width:'100%'}}/>


    if (init_count++ == 0 && (utils.isIos() || utils.isAndroid())) {
        AppPin.addListener("backButton", () => {
            if (window.location.pathname == "/") {
                if (Date.now() - lastTime > 2000) {
                    lastTime = Date.now();
                    Toast.show({text: "Please click BACK again to exit!", position: "center", duration: "short"})
                } else {
                    AppPin.exitApp();
                }
            } else {
                window.location.href = "/"
            }
        })
    }

    const baseURL = process.env.NODE_ENV === 'production' ? config.baseUrl : process.env.REACT_APP_DEV_API_URL;
    const routerRef = useRef<HTMLIonRouterOutletElement | null>(null);


    useEffect(() => {
        if (utils.isApp()) {
            const gesture: Gesture = createGesture({
                el: document.querySelector('.rectangle-content'),
                threshold: 100,
                direction: "x",
                disableScroll: true,
                gestureName: 'my-gesture',
                onEnd: ev => {
                    if(window.location.pathname == "/"){
                        return;
                    }
                    if (ev.deltaX >= Math.ceil(document.documentElement.clientWidth / 2)) {
                        window.location.href = "./"
                    } else {
                        //@ts-ignore
                        document.querySelector('.rectangle-content').style.transform = `translateX(0px)`
                    }
                },
                onMove: ev => {
                    if(window.location.pathname == "/"){
                        return;
                    }
                    //@ts-ignore
                    document.querySelector('.rectangle-content').style.transform = `translateX(${Math.abs(ev.deltaX)}px)`
                }
            });
            gesture.enable();
        }
    }, [])

    return <>
        {
            <div className={`page`} id="page">
                <div className="page-inner">
                    <IonApp className="rectangle-content">
                        <Provider store={store}>
                            <Router basename={baseURL}>
                                <Switch>
                                    {/*<Route exact path="/:tribeId" component={(props: any) => {*/}
                                    {/*    const tribeId = props.match.params.tribeId;*/}
                                    {/*    config.tribeId = tribeId;*/}
                                    {/*    return <DashboardV2 tribeId={tribeId} router={routerRef.current}/>*/}
                                    {/*}}/>*/}

                                    <Route exact path="/:tribeId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        config.tribeId = tribeId;
                                        return <DashboardV2 tribeId={tribeId} router={routerRef.current}/>
                                    }}/>

                                    <Route exact path="/cat/list" component={(props: any) => {
                                        return <CatPage router={routerRef.current}/>
                                    }}/>

                                    <Route exact path="/:tribeId/:msgId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        const msgId = props.match.params.msgId;
                                        config.tribeId = tribeId;
                                        return <DashboardV2 tribeId={tribeId} router={routerRef.current} msgId={msgId}/>
                                    }}/>


                                    {/*<Route exact path="/home" component={(props:any)=>{*/}
                                    {/*    return <HomePage />*/}
                                    {/*}}/>*/}

                                    <Route exact path="/" component={(props: any) => {
                                        // setTimeout(()=>{
                                        //     window.location.href = `./4E6BFunxNE5`
                                        // },500)
                                        // config.tribeId = tribeId;
                                        return <HomePage router={routerRef.current}/>
                                    }}/>
                                </Switch>
                            </Router>
                        </Provider>
                    </IonApp>
                </div>
            </div>
        }
    </>
}

export default App;
