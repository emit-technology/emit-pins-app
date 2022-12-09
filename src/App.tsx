import {Redirect, Route, Switch,BrowserRouter as Router} from 'react-router-dom';
import {
    IonApp, IonContent, IonHeader, IonIcon, IonMenu, IonTitle, IonToolbar,
    setupIonicReact
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
import {DashboardV1} from "./pages/Dashboard";
import React, {useEffect, useRef, useState} from "react";
import config from "./common/config";
import {Provider} from "react-redux";
import store from "./common/state/app/store";
import {HomePage} from "./pages/Home";
import {DashboardV2} from "./pages/Dashboard/index2";
import {DashboardV2Test} from "./pages/Dashboard/indexTest";
import {DashboardV3} from "./pages/Dashboard/indexV3";
import {DashboardV4} from "./pages/Dashboard/indexV4";
import {DashboardV2Test2} from "./pages/Dashboard/indexTestV2";
import {DashboardTestScroller} from "./pages/Dashboard/indexVirtualScroller";
setupIonicReact({
    mode: "ios",
});

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
    const baseURL = process.env.NODE_ENV === 'production' ? config.baseUrl : process.env.REACT_APP_DEV_API_URL;
    const routerRef = useRef<HTMLIonRouterOutletElement | null>(null);
    return <>
        {
            <div className={`page`} id="page">
                <div className="page-inner">
                    <IonApp>
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

                                    <Route exact path="/v1/:tribeId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        config.tribeId = tribeId;
                                        return <DashboardV1 tribeId={tribeId} router={routerRef.current}/>
                                    }}/>

                                    <Route exact path="/test/:tribeId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        config.tribeId = tribeId;
                                        return <DashboardV2Test tribeId={tribeId} router={routerRef.current}/>
                                    }}/>
                                    <Route exact path="/test2/:tribeId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        config.tribeId = tribeId;
                                        return <DashboardV2Test2 tribeId={tribeId} router={routerRef.current}/>
                                    }}/>

                                    <Route exact path="/scroller/:tribeId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        config.tribeId = tribeId;
                                        return <DashboardTestScroller tribeId={tribeId} router={routerRef.current}/>
                                    }}/>

                                    <Route exact path="/v3/:tribeId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        config.tribeId = tribeId;
                                        return <DashboardV3 tribeId={tribeId} router={routerRef.current}/>
                                    }}/>

                                    <Route exact path="/v4/:tribeId" component={(props: any) => {
                                        const tribeId = props.match.params.tribeId;
                                        config.tribeId = tribeId;
                                        return <DashboardV4 tribeId={tribeId} router={routerRef.current}/>
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
                                        return <HomePage  router={routerRef.current}/>
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
