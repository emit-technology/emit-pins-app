import {StatusBar, Style} from '@capacitor/status-bar';

// iOS only
// window.addEventListener('statusTap', function () {
//     console.log('statusbar tapped');
// });

// Display content under transparent status bar (Android only)
// StatusBar.setOverlaysWebView({ overlay: true });

export const setStatusBarStyleDark = async () => {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.hide();
    const info = await StatusBar.getInfo();
    if(info.style == Style.Dark){
        //text = light
        await StatusBar.setStyle({ style: Style.Light });

    }else if (info.style == Style.Light){
        //text= dark
    }
    await StatusBar.setBackgroundColor({color: "#ffffff"})
};

export const setStatusBarStyleLight = async () => {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({color: "#ffffff"})
};

export const setStatusBarStyleDefault = async () => {
    await StatusBar.setStyle({ style: Style.Default });
};

export const hideStatusBar = async () => {
    await StatusBar.hide();
};

export const showStatusBar = async () => {
    await StatusBar.show();
};