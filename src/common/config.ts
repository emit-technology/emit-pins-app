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
    baseUrl: string;
    nodeUrl: string;
    emitNode: string;
    tribeNode: string;
    tribeWs: string;
    tribePic: string;
    picHost: string;
    tribeId?: string;
    isAlive: boolean
    userLimit: UserLimit;
    airdropHandler: string;
    // assetsUrl:string
    defaultTribes: string
}

const NODE_ENV: string = process.env.NODE_ENV || 'development';

const development: IConfig = {
    baseUrl: "https://pins.emit.technology",
    // nodeUrl: "https://core-node-beta.emit.technology",
    nodeUrl: "http://127.0.0.1:8585",
    emitNode: "https://node-account.emit.technology",
    tribeNode: "https://pins-api.emit.technology",
    tribeWs: "wss://pins-ws.emit.technology/ws",
    tribePic: "https://pins.emit.technology/pic",
    picHost: "https://pic.emit.technology/img/",
    isAlive: false,
    userLimit: {maxMsgCount: 0, maxSupportCount: 0, msgLeft: 0, supportLeft: 0},
    airdropHandler: "EL79FoZQ7ty8zbPHS64tNptBP5QfeLPafTbS6Bd7TQN8G9g2F",
    // assetsUrl: "https://pins.emit.technology/asset/",
    defaultTribes: "4E6BFunxNE5"
};

const production: IConfig = {
    baseUrl: "https://pins.emit.technology",
    nodeUrl: "https://core-node-beta.emit.technology",
    emitNode: "https://node-account.emit.technology",
    tribeNode: "https://pins-api.emit.technology",
    tribeWs: "wss://pins-ws.emit.technology/ws",
    tribePic: "https://pins.emit.technology/pic",
    picHost: "https://pic.emit.technology/img/",
    isAlive: false,
    userLimit:  {maxMsgCount: 0, maxSupportCount: 0, msgLeft: 0, supportLeft: 0},
    airdropHandler: "EL79FoZQ7ty8zbPHS64tNptBP5QfeLPafTbS6Bd7TQN8G9g2F",
    // assetsUrl: "https://pins.emit.technology/asset/",
    defaultTribes: "4E6BFunxNE5"
}

const config: {
    [name: string]: IConfig
} = {
    development,
    production
};

export default config[NODE_ENV];
