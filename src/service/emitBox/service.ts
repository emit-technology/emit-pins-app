import {AccountModel, ChainType, Factor} from '@emit-technology/emit-lib';
import EmitBox from '@emit-technology/emit-account-node-sdk';
import selfStorage from "../../common/storage";
import config from "../../common/config";
import Web3 from "web3";
import {utils} from "../../common";
import walletWorker from "../../worker/walletWorker";

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

        /**
         *  network: INetwork;
         dapp?:IDapp;
         version:string
         backupAccountUrl?: string;
         */
            //network: {nodeUrl: "https://core-node-beta.emit.technology", chainId: "667", chainType: ChainType.EMIT.valueOf()},
            console.log("utils.isIos() || utils.isSafari()",utils.isIos() ,utils.isSafari());
        const emitBox = new EmitBox(dapp, {
                nodeUrl: config.nodeUrl,
                chainId: "667",
                chainType: ChainType.EMIT.valueOf(),
                backupAccountUrl: (utils.isIos() || utils.isSafari()) && `${config.baseUrl}/account/#/widget`
            });
        this.emitBox = emitBox;
        const bscProvider = emitBox.newProvider({
            dapp: dapp,
            network: {nodeUrl: "https://node-bsc.bangs.network", chainId: "1", chainType: ChainType.BSC.valueOf()},
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
        if(act && act.addresses){
            // act.addresses[ChainType.EMIT] = "";
        }
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

    getFactor = async (address: string): Promise<Array<Factor>> => {
        const rest = await emitBoxSdk.emitBox.emitDataNode.getFactors(address)
        // let ret:Array<Factor> = [];
        // if (rest) {
        //     for (let factor of rest) {
        //         const symbol = utils.formatCategoryString(factor.category);
        //         const b = utils.fromHexValue(factor.value, 0).toString(10);
        //         ret[symbol] = b;
        //     }
        // }
        return Promise.resolve(rest)
    }

    emitSend = async (receive: string, amount: string, factor: Factor, outData: string, datasets: Array<any>) => {
        const account = await emitBoxSdk.getAccount();
        const from = account.addresses[ChainType.EMIT];
        const prepareBlock = await emitBoxSdk.emitBox.emitDataNode.genPrepareBlock(
            from,
            datasets,
            {
                settles: [],
                outs: [
                    {
                        target: receive,
                        factor: {
                            category: factor.category,
                            value: utils.toValueHex(amount),
                        },
                        data: outData ? Buffer.from(outData).toString("hex") : ""//TODO for refer data
                    },
                ],
            },
            undefined
        );

        if(utils.useInjectAccount()){
            const signData = await walletWorker.signTx(account.accountId,"",ChainType.EMIT.valueOf(),prepareBlock)
            await emitBoxSdk.emitBox.emitDataNode.prepareBlockWithSign(prepareBlock,{error: null, result: signData});
        }else{
            await emitBoxSdk.emitBox.emitDataNode.prepareBlock(prepareBlock);
        }

        return Promise.resolve({
            transactionHash: prepareBlock.blk.parent_hash,
            blockNumber: prepareBlock.blk.num,
            address: from
        })
    }

}

export const emitBoxSdk = new EmitBoxSdk();