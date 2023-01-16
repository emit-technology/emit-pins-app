import {getColor, getPalette} from 'color-thief-react'
import BigNumber from "bignumber.js";
import reactImageSize from 'react-image-size';

import 'dear-image.detect-background-color';

const DearImage = require('dear-image');

export const getBackgroundColor = async (image:string): Promise<string> =>{
    const resp = await fetch(image);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    return DearImage.detectBackgroundColor(url);
}

export interface ThemeColors {
    primary: string;
    palette: Array<string>;

    isDarkColor: boolean

    badge: {
        color: string,
        background: string
    }

    text: {
        color: string;
        translucent: string;
    }

    width: number;
    height: number;

}

interface SimilarColors {

    isDarkColor: boolean

    badge: {
        color: string,
        background: string
    }

    text: {
        color: string;
        translucent: string;
    }

}

const getMainColor = async (src: string): Promise<ThemeColors> => {
    const color = await getColor(src, "rgbArray")
    const palette = await getPalette(src, 10, "rgbArray")
    console.log(src , "---> ", palette)

    palette.sort(sortRgb);

    let isDarkColor = false;
    let badge, text;
    const primary = `rgb(${color[0]},${color[1]},${color[2]})`;
    if ((color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114) < 186) {
        isDarkColor = true
        badge = {background: "rgba(255,255,255,0.5)", color: primary}
        text = {color: `#ffffff`, translucent: "rgba(255,255,255,0.5)"}
    } else {
        badge = {background: "rgba(0,0,0,0.5)", color: "#000000"}
        text = {color: `#000000`, translucent: "rgba(0,0,0,0.5)"}
    }
    const { width, height } = await reactImageSize(src);

    return {
        primary: primary,
        palette: palette.map(v => {
            return `rgb(${v[0]},${v[1]},${v[2]})`
        }),
        isDarkColor: isDarkColor,
        badge: badge,
        text: text,
        width: width,
        height: height
    }
};

export const getBgColor = async (src: string) => {
    const color = await getColor(src, "rgbArray")
    return `rgb(${color[0]},${color[1]},${color[2]})`
};

export const getSimilarColor = (color: string): SimilarColors => {
    if (color.indexOf('#') != -1) {
        color = set16ToRgb(color)
    }

    let isDarkColor: boolean = false;
    let badge, text;
    let colorValue = color.replace('rgb(', '').replace(')', '')
    const colorArray: any = colorValue.split(',');
    if ((colorArray[0] * 0.299 + colorArray[1] * 0.587 + colorArray[2] * 0.114) < 186) {
        isDarkColor = true;
        badge = {background: "rgba(255,255,255,0.5)", color: color}
        text = {color: `#ffffff`, translucent: "rgba(255,255,255,0.5)"}
    } else {
        badge = {background: "rgba(0,0,0,0.5)", color: "#000000"}
        text = {color: `#000000`, translucent: "rgba(0,0,0,0.5)"}
    }
    console.info("isDarkColor==",isDarkColor)
    return {
        isDarkColor: isDarkColor,
        badge: badge,
        text: text
    }


};

export function set16ToRgb(str: string, a:number = 1) {
    // var reg = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    // if(!reg.test(str)){return;}
    let newStr = (str.toLowerCase()).replace(/\#/g, '')
    let len = newStr.length;
    if (len == 3) {
        let t = ''
        for (let i = 0; i < len; i++) {
            t += newStr.slice(i, i + 1).concat(newStr.slice(i, i + 1))
        }
        newStr = t
    }
    let arr = [];
    for (let i = 0; i < 6; i = i + 2) {
        let s = newStr.slice(i, i + 2)
        arr.push(parseInt("0x" + s))
    }
    return 'rgba(' + arr.join(",") + a + ')';
}

function sortRgb(a: Array<number>, b: Array<number>) {
    return powN(a) - powN(b)
}

function powN(a: Array<number>) {
    const a0 = new BigNumber(a[0]).pow(2)
    const a1 = new BigNumber(a[1]).pow(2)
    const a2 = new BigNumber(a[2]).pow(2)
    return (a0.plus(a1).plus(a2)).sqrt().toNumber()
}

export default getMainColor;