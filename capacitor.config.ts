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
    },
};

export default config;
