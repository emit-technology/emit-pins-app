import { PushNotifications } from '@capacitor/push-notifications';
import selfStorage from "../../common/storage";
import {tribeService} from "../tribe";
import {Device} from "@capacitor/device";

export const isApp = async () =>{
    try {
        const deviceInfo = await Device.getInfo();
        return deviceInfo.platform == "ios" || deviceInfo.platform == "android"
    }catch (e){
        console.error(e)
    }
    return false;
}

export const addListeners = async () => {
    if(! await isApp()){
        return;
    }
    await PushNotifications.addListener('registration', token => {
        console.info('Registration token: ', token.value);
        selfStorage.setItem("pushTokenValue", token.value)

        tribeService.registerDevice(token.value).then(rest=>{
            console.log("registerDevice success");
        }).catch(e=>{
            console.error("registerDevice err: ",e)
        });
    });

    await PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
        selfStorage.setItem("pushTokenErr", err.error)
    });

    await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push notification received: ', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });
}

export const registerNotifications = async () => {
    if(! await isApp()){
        return;
    }
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
    }

    await PushNotifications.register();
}

export const getDeliveredNotifications = async () => {
    if(! await isApp()){
        return;
    }
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('delivered notifications', JSON.stringify(notificationList));
}