import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'technology.emit.pins',
    appName: 'EMIT PINs',
    webDir: 'build',
    bundledWebRuntime: false,
    plugins: {
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
        },
        "SplashScreen": {
            "launchShowDuration": 3000,
            "launchAutoHide": true,
            "backgroundColor": "#ffffffff"
        }
    },
};

export default config;
