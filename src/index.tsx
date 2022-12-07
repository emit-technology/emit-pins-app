import React from 'react';
import {render, hydrate} from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import {App as AppPlugin} from "@capacitor/app";
import { Toast } from '@capacitor/toast';
import {addListeners, getDeliveredNotifications, registerNotifications} from './service/app'
import {utils} from "./common";
import {LogLevel} from "react-virtuoso";

import 'overlayscrollbars/overlayscrollbars.css';
import {ParallaxProvider} from "react-scroll-parallax";
// import { SplashScreen } from '@capacitor/splash-screen';

globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;

const rootElement = document.getElementById("root");

if (rootElement.hasChildNodes()) {
    console.log("hydrate mode");
    hydrate(<React.StrictMode>
        <ParallaxProvider>
        <App />
        </ParallaxProvider>
    </React.StrictMode>, rootElement);
} else {
    console.log("render mode");
    render(<React.StrictMode>
            <App />
    </React.StrictMode>, rootElement);
}
console.log("added app url open listener.")

AppPlugin.addListener("appUrlOpen",(appUrlOpen)=>{
    console.log("app open pins: ", JSON.stringify(appUrlOpen));
    Toast.show({
        text: 'app url open emit pins!',
    });
    Toast.show({
        text: JSON.stringify(appUrlOpen),
    });
})
console.log("utils.isAndroid():: ",utils.isAndroid());

if(utils.isIos() || utils.isAndroid()){
    addListeners().catch(e=>{
        console.error("notification listen error",e)
    })

    registerNotifications().catch(e=>{
        console.error("notification register error",e)
    })

    getDeliveredNotifications().catch(e=>{
        console.error("notification getDeliveredNotifications error",e);
    })

}



// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );
defineCustomElements(window).catch(e=>console.error("defineCustomElements error: ",e));

// console.log=(function (oriLogFunc) {
//     return function () {
//         oriLogFunc(new Date().toLocaleString(), ...arguments)
//     }
// })(console.log)


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
