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
}

const NODE_ENV: string = process.env.NODE_ENV || 'development';
const development: IConfig = {
    emitNode: "https://node-account.emit.technology",
    tribeNode: "https://pins-api.emit.technology",
    tribeWs: "wss://pins-ws.emit.technology/ws",
    tribePic: "https://pic.emit.technology",
    picHost: "https://pic.emit.technology/img/",
    isAlive: false
};

const production: IConfig = {
    emitNode: "https://node-account.emit.technology",
    tribeNode: "https://pins-api.emit.technology",
    tribeWs: "wss://pins-ws.emit.technology/ws",
    tribePic: "https://pic.emit.technology",
    picHost: "https://pic.emit.technology/img/",
    isAlive: false
}

const config: {
    [name: string]: IConfig
} = {
    development,
    production
};

export default config[NODE_ENV];
