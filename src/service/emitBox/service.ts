import {AccountModel,ChainType} from '@emit-technology/emit-lib';
import EmitBox from '@emit-technology/emit-account-node-sdk';
import selfStorage from "../../common/storage";
import config from "../../common/config";
import Web3 from "web3";

const dapp = {
    name: "EMIT-IM",
    url: "http://localhost:3002",
    category: "web3",
    contractAddress: ""
}

class EmitBoxSdk {

    key = "ACCOUNT";

    emitBox: EmitBox;

    web3: { [chain: number]: Web3 }

    constructor() {
        const emitBox = new EmitBox(dapp, {nodeUrl:config.emitNode,chainType:ChainType.EMIT.valueOf()});
        this.emitBox = emitBox;
        const bscProvider = emitBox.newProvider({
            dapp: dapp,
            network:  {nodeUrl: "https://node-bsc.bangs.network", chainId: "1", chainType: ChainType.BSC.valueOf()},
            version: "1.0"
        });
        // const bscProvider = emitBox.newProvider({
        //     dapp: dapp,
        //     network: config.chains[ChainType.BSC].network,
        //     version: "1.0"
        // });
        this.web3 = {
            // [ChainType.ETH]: new Web3(ethProvider),
            [ChainType.BSC]: new Web3(bscProvider)
        }
    }

    showWidget = () => {
        this.emitBox.showWidget().catch(e => {
            console.error(e)
        });
    }

    getAccount = async (): Promise<AccountModel> => {
        const act: AccountModel = selfStorage.getItem(this.key)
        return act
    }

    setAccount = async (account: AccountModel) => {
        selfStorage.setItem(this.key, account);
        return new Promise(resolve => {
            setTimeout(() => {
                if (selfStorage.getItem(this.key)) {
                    resolve(account)
                }
            }, 200)
        })
    }

}

export const emitBoxSdk = new EmitBoxSdk();