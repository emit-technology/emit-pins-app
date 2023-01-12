import React from 'react';
import {render, hydrate} from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {defineCustomElements} from '@ionic/pwa-elements/loader';
import {App as AppPlugin} from "@capacitor/app";
import {
    addListeners,
    getDeliveredNotifications,
    setStatusBarStyleLight,
    registerNotifications,
    isApp,
    setStatusBarStyleDark
} from './service/app'
import {utils} from "./common";
import {LogLevel} from "react-virtuoso";
import ResizeObserver from 'resize-observer-polyfill'

import 'overlayscrollbars/overlayscrollbars.css';
import {ParallaxProvider} from "react-scroll-parallax";
import config from "./common/config";
// import { SplashScreen } from '@capacitor/splash-screen';

// globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;

const rootElement = document.getElementById("root");

if (!window.ResizeObserver)
    window.ResizeObserver = ResizeObserver

// Virtuoso's resize observer can this error,
// which is caught by DnD and aborts dragging.
window.addEventListener("error", (e) => {
    // console.log("stopImmediatePropagation", e)
    if (
        e.message ===
        "ResizeObserver loop completed with undelivered notifications." ||
        e.message === "ResizeObserver loop limit exceeded"
    ) {
        // console.log("=====> stopImmediatePropagation")
    e.stopImmediatePropagation();
    }
});

if (rootElement.hasChildNodes()) {
    console.log("hydrate mode");
    hydrate(<React.StrictMode>
        <ParallaxProvider>
            <App/>
        </ParallaxProvider>
    </React.StrictMode>, rootElement);
} else {
    console.log("render mode");
    render(<React.StrictMode>
        <App/>
    </React.StrictMode>, rootElement);
}
console.log("added app url open listener.")

AppPlugin.addListener("appUrlOpen", (appUrlOpen) => {
    console.log("app open pins: ", JSON.stringify(appUrlOpen));
    const tribeId = utils.getTribeIdFromUrl(appUrlOpen.url);
    if (tribeId.length >= 11) {
        window.location.href = `./${tribeId}`;
    }
    // Toast.show({
    //     text: 'app url open emit pins!',
    // });
    // Toast.show({
    //     text: JSON.stringify(appUrlOpen),
    // });
})

if (utils.isIos() || utils.isAndroid()) {


    if (utils.isIos()) {
        setStatusBarStyleLight();
    } else {
        setStatusBarStyleDark()
    }

    addListeners().catch(e => {
        console.error("notification listen error", e)
    })

    registerNotifications().catch(e => {
        console.error("notification register error", e)
    })

    getDeliveredNotifications().catch(e => {
        console.error("notification getDeliveredNotifications error", e);
    })

    let timer;

    isApp().then(f => {
        if (!f) {
            timer = setTimeout(() => {
                // if(utils.isIos()){
                //     //@ts-ignore
                //     window.location = "https://testflight.apple.com/join/8smFQVxG";
                // }else{
                //     //@ts-ignore
                //     window.location = "https://testflight.apple.com/join/8smFQVxG";
                // }
            }, 3000)
            window.location.href = `emitcorepins://${config.tribeId ? config.tribeId : ""}`
        }
    })

    if (document.hidden !== undefined) {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
            } else {
                clearTimeout(timer)
            }
        })
    }
}


// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );
defineCustomElements(window).catch(e => console.error("defineCustomElements error: ", e));

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
