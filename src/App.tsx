import {Redirect, Route, Switch} from 'react-router-dom';
import {
    IonApp, IonContent, IonHeader, IonIcon, IonMenu, IonTitle, IonToolbar,
    setupIonicReact
} from '@ionic/react';
import {IonReactHashRouter as Router} from '@ionic/react-router';

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
import {Dashboard} from "./pages/Dashboard";
import React, {useEffect, useState} from "react";
import config from "./common/config";
import {Provider} from "react-redux";
import store from "./common/state/app/store";
import {closeOutline} from "ionicons/icons";
import selfStorage from "./common/storage";

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
    // console.log("page show tips",showTip);
    return <>
        <div className={`page`}>

            <div className="page-inner">
                {/*{*/}
                {/*    showTip && <div id="spash-div" style={{position:"absolute",zIndex: 100,height:'100%', width:mobileWidth?'780px':'100%', overflow:"hidden"}}  onClick={()=>{*/}
                {/*        selfStorage.setItem("readTip",true)*/}
                {/*        document.getElementById("spash-div").style.height = '0px' ;*/}
                {/*    }}>*/}
                {/*        <div style={{position: "absolute",height:'100%',top: '20px', right: '20px', color: '#ffffff', fontSize: '32px'}}>*/}
                {/*            <IonIcon src={closeOutline}/>*/}
                {/*        </div>*/}
                {/*        <Tip/>*/}
                {/*    </div>*/}
                {/*}*/}
                <IonApp>
                    <Provider store={store}>
                        <Router>
                            <Switch>

                                {/*<IonMenu side="end" type="push">*/}
                                {/*    <IonHeader>*/}
                                {/*        <IonToolbar color="danger">*/}
                                {/*            <IonTitle>End Menu</IonTitle>*/}
                                {/*        </IonToolbar>*/}
                                {/*    </IonHeader>*/}
                                {/*    <IonContent>*/}
                                {/*        <RoleListModal roles={} tribeInfo={} defaultRole={} onRoleCheck={} onReloadList={} />*/}
                                {/*    </IonContent>*/}
                                {/*</IonMenu>*/}

                                <Route exact path="/:tribeId" component={(props: any) => {
                                    const tribeId = props.match.params.tribeId;
                                    config.tribeId = tribeId;
                                    return <Dashboard tribeId={tribeId}/>
                                }}/>
                            </Switch>
                        </Router>
                    </Provider>
                </IonApp>
            </div>
        </div>
    </>
}

export default App;
