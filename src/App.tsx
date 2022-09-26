import {Redirect, Route, Switch} from 'react-router-dom';
import {
    IonApp, IonContent, IonHeader, IonMenu, IonTitle, IonToolbar,
    setupIonicReact
} from '@ionic/react';
import {IonReactRouter as Router} from '@ionic/react-router';

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
import React from "react";
import config from "./common/config";
import {Provider} from "react-redux";
import store from "./common/state/app/store";

setupIonicReact({
    mode: "ios",
});

const App: React.FC = () => {
    // const [roles,setRoles] = React.useState([]);
    // const [tribeInfo,setTribeInfo,]
    return <>
        <div className={`page`}>
            <div className="page-inner">
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
