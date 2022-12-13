import axios from "axios";
import {Camera, CameraResultType, CameraSource, Photo} from "@capacitor/camera";
import getMainColor, {ThemeColors} from "../common/getMainColor";
import {tribeService} from "../service/tribe";

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

    upload = async (): Promise<Photo> => {
        try {
            console.log("upload....");
            const domm = document.querySelector('#_capacitor-camera-input');
            if (domm) {
                domm.remove();
            }
            console.log("Camera.getPhoto....");
            const image = await Camera.getPhoto({
                webUseInput: true,
                quality: 100,
                resultType: CameraResultType.Uri,
                source: CameraSource.Photos,
            });
            return image;
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