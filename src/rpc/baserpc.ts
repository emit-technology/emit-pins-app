import axios from "axios";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";
import selfStorage from "../common/storage";
import getMainColor, {ThemeColors} from "../common/getMainColor";
import {tribeService} from "../service/tribe";
import {utils} from "../common";


export class BaseRpc {

    _url: string;

    constructor(url: string) {
        this._url = url;
    }

    post = async (path: string, data: any): Promise<any> => {
        const authToken = tribeService.getAuthToken();
        const rest = await axios.post(`${this._url}${path}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': authToken
            }
        })
        return rest.data;
    }

    get = async (params: string): Promise<any> => {
        const _url = `${this._url}${params}`;
        const {data} = await axios.get(_url);
        return data;
    }

    upload = async (): Promise<{ url: string, themeColors: ThemeColors }> => {
        try {
            console.log("upload....");

            // if (utils.isIos()) {
            //     const permissions = await Camera.checkPermissions()
            //     console.log(permissions, "permissionsReq")
            //     if (permissions.photos != "granted") {
            //         const permissionsReq = await Camera.requestPermissions()
            //         console.log(permissionsReq, "permissionsReq==")
            //     }
            // }

            const domm = document.querySelector('#_capacitor-camera-input');
            if (domm) {
                domm.remove();
            }
            console.log("Camera.getPhoto....");
            const image: any = await Camera.getPhoto({
                webUseInput: true,
                quality: 100,
                resultType: CameraResultType.Uri,
                source: CameraSource.Photos,
            });
            console.log(image);
            const themeColors = await getMainColor(image.webPath);
            console.log(themeColors);
            const file = await fetch(image.webPath).then(r => r.blob()).then(blobFile => new File([blobFile], `file.${image.format}`, {type: blobFile.type}));
            const data = await this.uploadFile(file);

            return {url: data["url"].replace("http://", "https://"), themeColors: themeColors};
        } catch (e) {
            console.error(e)
            return Promise.reject(e)
        }

    }

    uploadFile = async (file: File): Promise<any> => {
        // const file = await fetch(image.webPath).then(r => r.blob()).then(blobFile => new File([blobFile], `file.${image.format}`, {type: blobFile.type}));
        const formData = new FormData();
        formData.append('data', file);
        const {data} = await axios.post(`${this._url}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return data;
    }
}