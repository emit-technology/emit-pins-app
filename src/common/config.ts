import {UserLimit} from "../types";

/**
 * name: string;
 symbol: string;
 decimal: number;
 totalSupply: string;
 contractAddress: string;
 image?: string;
 protocol:TokenProtocol;
 chain: ChainType;
 */
interface IConfig {
    emitNode: string;
    tribeNode: string;
    tribeWs: string;
    tribePic: string;
    picHost: string;

    tribeId?: string;
    isAlive: boolean

    userLimit: UserLimit;


}

const NODE_ENV: string = process.env.NODE_ENV || 'development';
const development: IConfig = {
    emitNode: "https://node-account.emit.technology",
    tribeNode: "https://pins-api.emit.technology",
    tribeWs: "wss://pins-ws.emit.technology/ws",
    tribePic: "https://pins.emit.technology/pic",
    picHost: "https://pic.emit.technology/img/",
    isAlive: false,
    userLimit: {maxMsgCount: 0, maxSupportCount: 0, msgLeft: 0, supportLeft: 0}
};

const production: IConfig = {
    emitNode: "https://node-account.emit.technology",
    tribeNode: "https://pins-api.emit.technology",
    tribeWs: "wss://pins-ws.emit.technology/ws",
    tribePic: "https://pins.emit.technology/pic",
    picHost: "https://pic.emit.technology/img/",
    isAlive: false,
    userLimit:  {maxMsgCount: 0, maxSupportCount: 0, msgLeft: 0, supportLeft: 0}
}

const config: {
    [name: string]: IConfig
} = {
    development,
    production
};

export default config[NODE_ENV];
