import BigNumber from 'bignumber.js';
import config from "./config";
import {ImageType, Message, MessageType, MsgText, MsgTextImage, TribeRole} from "../types";
import {Category} from "@emit-technology/emit-lib";
import selfStorage from "./storage";
import { Browser } from '@capacitor/browser';

const format = require('date-format');
const BN = require("bn.js");


const imageUrlObj:any = {};

export const utils = {
    ellipsisStr: function (v: string, num?: number) {
        if (!v) return ""
        if (!num) {
            num = 7
        }
        if (v.length >= 15) {
            return v.slice(0, num) + "..." + v.slice(v.length - num, v.length);
        }
        return v
    },


    formatValueString: function (value: string | BigNumber | number | undefined, fix: number = 3): string {
        if (!value) {
            return "0.000"
        }
        return this.nFormatter(this.fromValue(value, 18), fix)
    },

    fromValue: function (value: string | BigNumber | number | undefined, decimal: number): BigNumber {
        if (!value) {
            return new BigNumber(0)
        }
        return new BigNumber(value).dividedBy(10 ** decimal)
    },

    toValue: function (value: string | BigNumber | number, decimal: number): BigNumber {
        if (!value) {
            return new BigNumber(0)
        }
        return new BigNumber(value).multipliedBy(10 ** decimal)
    },
    toValueHex(v: any, decimal: number = 18) {
        const cv = new BigNumber(v).multipliedBy(10 ** decimal).toString(16);
        return new BN(cv, "hex").toArrayLike(Buffer, "be", 32).toString("hex");
    },
    nFormatter: function (n: number | BigNumber | string | undefined, digits: number) {
        if (!n || new BigNumber(n).toNumber() == 0) {
            return "0"
        }
        const num = new BigNumber(n).toNumber();
        const si = [
            {value: 1, symbol: ""},
            {value: 1E3, symbol: "K"},
            {value: 1E6, symbol: "M"},
            {value: 1E9, symbol: "G"},
            {value: 1E12, symbol: "T"},
            {value: 1E15, symbol: "P"},
            {value: 1E18, symbol: "E"}
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        let i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
        return new BigNumber(n).dividedBy(new BigNumber(si[i].value)).toFixed(digits, 1).replace(rx, "$1") + si[i].symbol;
    },
    toHex(value: string | number | BigNumber, decimal?: number): string {
        if (value === "0x") {
            return "0x0"
        }
        if (decimal) {
            return "0x" + this.toValue(value, decimal).toString(16);
        }
        return "0x" + new BigNumber(value).toString(16)
    },

    dateFormat(date: Date) {
        return format("MM/dd hh:mm", date);
        // return date.toString();
    },

    dateFormatStr(date: Date) {
        // return format("MM/dd hh:mm", date);
        return date.toLocaleTimeString(["en"], {hour12: true,hour: '2-digit', minute:'2-digit'}) + " · " + date.toLocaleDateString(["en-US"],{year:"2-digit",month:"short", day:"2-digit"});
    },

    toHash(v: string): string {
        return Buffer.alloc(32, 0)
            .fill(Buffer.from(v), 0, Buffer.from(v).length)
            .toString("hex");

    },


    strToHex: (v: string, len: number = 32) => {
        const buf = Buffer.alloc(len, 0);
        const dataBuf = Buffer.from(v);
        if (dataBuf.length > len) {
            throw new Error("str is too long");
        }
        return buf.fill(dataBuf, 0, dataBuf.length).toString("hex");
    },

    fromHex(v: string): any {
        if (!v) {
            return "";
        }
        const chr = "\u0000";
        const regex = "/" + chr + "/g";
        //.replace(regex,"");
        const str = Buffer.from(v, "hex").toString();
        return str.replace(eval(regex), "");
    },

    fromHexValue: (v: string, decimal: number = 18): BigNumber => {
        return new BigNumber(new BN(v, "hex", "be").toString()).dividedBy(
            10 ** decimal
        );
    },

    getDisPlayUrl: (image: ImageType): string => {
        if (!image) {
            return ""
        }
        return typeof image == 'string' ? image as string :
            utils.convertImgDisplay((image as MsgTextImage).width, (image as MsgTextImage).height, (image as MsgTextImage).url).displayUrl;
    },

    convertImgDisplay: (width: number, height: number, url: string): { width: number, height: number, displayUrl: string } => {
        // content.image.width>content.image.height? 200: content.image.height>300?300:content.image.height

        const base = utils.isIos() || utils.isAndroid() ?250:300;
        function _getHeight() {
            if (width > 0 && height > 0) {
                if (width > height) {
                    if (width > base) {
                        const ret = Math.floor(base * height / width)
                        return ret
                    } else {
                        if (height > base) {
                            return base;
                        } else {
                            return height;
                        }
                    }
                } else {
                    if (height > base) {
                        return base;
                    } else {
                        return height;
                    }
                }
            }
            return 200;
        }

        const h = _getHeight();
        const w = Math.floor(h * width / height);
        const webPath = url && (url.indexOf("blob") == 0 || url.indexOf("data") == 0) ? url : `${config.tribePic}/display?url=${url}&w=${w}&h=${h}&op=resize&upscale=1`;
        return {
            width: w, height: h, displayUrl: webPath
        }
    },

    getQueryString: (name: string) => {
        const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        const r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        }
        return '';
    },

    isIos: (): boolean => {
        const deviceInfo = selfStorage.getItem("deviceInfo")
        if(!!deviceInfo){
            return deviceInfo["platform"] == "ios";
        }
        //@ts-ignore
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        //@ts-ignore
        return /ipad|iphone|ipod/.test((userAgent as string).toLowerCase()) && !window.MSStream;
    },

    goTo: (verseId: string) =>{
        window.location.href = `/${verseId}`
    },

    isAndroid: (): boolean => {
        const deviceInfo = selfStorage.getItem("deviceInfo")
        if(!!deviceInfo){
            return deviceInfo["platform"] == "android";
        }
        //@ts-ignore
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        //@ts-ignore
        return /android/i.test(userAgent) && !window.MSStream;

    },

    isApp: ():boolean => utils.isIos()||utils.isAndroid(),

    isSafari: (): boolean => {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    },

    useInjectAccount: (): boolean => {
        // TODO For Test
        return true;
        // return utils.isIos() || utils.isAndroid() || utils.isSafari();
    },

    formatCategoryString: (category: Category): string => {
        const name = utils.fromHex(category.symbol);
        return name;
    },

    assetUrl: (): string => {
        if (utils.isSafari() || utils.isIos()) {
            return "https://pins.emit.technology/asset/"
        }
        return "https://assets.emit.technology/";
    },

    toLocalImageUrl: async (url: string): Promise<any> => {
        if (!!url) {
            if(!!imageUrlObj && imageUrlObj[url]){
                return imageUrlObj[url];
            }
            const rest = await fetch(url)
            const blob = await rest.blob();
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.addEventListener("load", ()=> {
                    if(!!imageUrlObj){
                        imageUrlObj[url] = reader.result as string;
                    }
                    resolve(reader.result as string);
                }, false);
                reader.readAsDataURL(blob)
            })
            //@ts-ignore
            // const urlCreator = window.URL || window.webkitURL;
            // return urlCreator.createObjectURL(blob);
        }
    },

    useBase64Img: ():boolean =>{
        // return true;
        return utils.isIos()// || utils.isSafari();
    },

    convertMsgImage: async (m: Message): Promise<Message> => {
        if(utils.useBase64Img()){
            const msg:Message = JSON.parse(JSON.stringify(m));
            if (msg.msgType == MessageType.Text) {
                const url = (msg.content as MsgText).image.url;
                if (!!url ) {
                    msg.content["image"]["url"] = await utils.toLocalImageUrl(url)
                }
            }else if(msg.msgType == MessageType.Airdrop){

            }else if(msg.msgType == MessageType.Role){
                const url = (msg.content as TribeRole).avatar["url"];
                msg.content["avatar"]["url"] = await utils.toLocalImageUrl(url as string)
            }
            if(msg.actor){
                msg.actor.avatar["url"] = await utils.toLocalImageUrl(msg.actor.avatar["url"])
            }
            return msg;
        }
        return m;
    },

    getTribeIdFromUrl : (value: string) =>{
        let tribeId = value;
        if(value && value.indexOf("https://pins.emit.technology/") > -1){
            tribeId = value.slice("https://pins.emit.technology/".length)
        }else if(value && value.indexOf("http://pins.emit.technology/") > -1){
            tribeId = value.slice("http://pins.emit.technology/".length)
        }else if(value && value.indexOf("emitcorepins://") > -1){
            tribeId = value.slice("emitcorepins://".length)
        }else if(value && value.replace("//"," ").indexOf("/") > -1){
            tribeId = value.slice(value.replace("//"," ").indexOf("/")+2)
        }
        return tribeId;
    }

}