import {AccountModel,ChainType} from '@emit-technology/emit-lib';

export interface IAccount {

    accounts: () => Promise<Array<AccountModel>>;

    // current: () => Promise<AccountModel>;

    signTx: () => Promise<any>;

    getAddress: (chain: ChainType) => Promise<string>;
}

