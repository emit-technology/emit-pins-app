import BigNumber from 'bignumber.js';
import config from "./config";
import {ImageType, MsgTextImage} from "../types";
import {Category, ChainType} from "@emit-technology/emit-lib";

const format = require('date-format');
const BN = require("bn.js");

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
            return "0.000"
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
        function _getHeight() {
            if (width > 0 && height > 0) {
                if (width > height) {
                    if (width > 300) {
                        const ret = Math.floor(300 * height / width)
                        return ret
                    } else {
                        if (height > 300) {
                            return 300;
                        } else {
                            return height;
                        }
                    }
                } else {
                    if (height > 300) {
                        return 300;
                    } else {
                        return height;
                    }
                }
            }
            return 200;
        }

// console.log(width, height ,url, "getHeight")
        const h = _getHeight();
        const w = Math.floor(h * width / height);
        return {
            width: w, height: h, displayUrl: `${config.tribePic}/display?url=${url}&w=${w}&h=${h}&op=resize&upscale=1`
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
        //@ts-ignore
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        //@ts-ignore
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return true
        }
        return false;
    },

    isSafari: ():boolean =>{
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    },

    formatCategoryString: (category: Category): string => {
        const name = utils.fromHex(category.symbol);
        return name;
    },

    assetUrl :():string =>{
        if(utils.isSafari() || utils.isIos()){
            return "https://pins.emit.technology/asset/"
        }
        return "https://assets.emit.technology/";
    }

}