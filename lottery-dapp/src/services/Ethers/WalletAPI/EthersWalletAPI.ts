import { SignatureLike } from '@ethersproject/bytes';
import { ethers } from 'ethers';
import log from 'loglevel';
import { eventChannel, EventChannel } from 'redux-saga';
import { DISABLE_WALLET_SIGN, SUPPORTED_NETWORKS } from '@/features/wallet/config.ts';
import { AccountType } from '@/features/wallet/models/account/types/Account.ts';
import { IWalletAPI } from '@/features/wallet/models/IWalletAPI.ts';

enum MetamaskRPCErrors {
  ACTION_REJECTED = 'ACTION_REJECTED',
}

export class EthersWalletAPI implements IWalletAPI {
  private static _instance: IWalletAPI | null = null;
  private _isUnlocked: boolean = false;
  private _isSigned: boolean = false;
  private _signerAddress: string | null = null;
  private _provider: ethers.providers.Web3Provider | null = null;
  private _network: ethers.providers.Network | null = null;
  private _accountChangeListener: EventChannel<any> | null = null;
  private _networkChangeListener: EventChannel<any> | null = null;

  private constructor() {}

  public static getInstance(): IWalletAPI {
    if (this._instance === null) {
      log.debug('ethers init');
      this._instance = new EthersWalletAPI();
    }
    return this._instance;
  }

  public loadProvider = async () => {
    if (window.ethereum) {
      // only metamask installed
      if (window.ethereum.isMetaMask) {
        this._provider = new ethers.providers.Web3Provider(
          window.ethereum,
          'any'
        );
      }
      // metamask and others installed, select Metamask
      if (window.ethereum.providers) {
        this._provider = new ethers.providers.Web3Provider(
          window.ethereum.providers.find((provider: any) => provider.isMetaMask)
        );
      }
    }
    return this._provider !== null;
  };

  public loadNetwork = async () => {
    await this._provider?.ready;
    this._network = this._provider ? await this._provider.getNetwork() : null;
    const isSupported: boolean = await this._isNetworkSupported(null);
    if (!isSupported) {
      this._network = null;
    }
    return this.getNetwork();
  };

  public getNetwork = () => {
    return SUPPORTED_NETWORKS.find(
      chain => chain.chainId === this._network?.chainId
    );
  };

  public switchNetwork = async (networkId: number) => {
    const isSupported = this._isNetworkSupported(networkId);
    if (!isSupported) {
      return false;
    }
    await this._provider?.ready;
    log.debug('0x' + networkId.toString(16));
    try {
      await this._provider?.send('wallet_switchEthereumChain', [
        { chainId: '0x' + networkId.toString(16) },
      ]);
      return true;
    } catch (error: any) {
      const networkDetails = SUPPORTED_NETWORKS.find(
        chain => chain.chainId === networkId
      );
      await this._provider?.send('wallet_addEthereumChain', [
        {
          chainId: '0x' + networkId.toString(16),
          rpcUrls: networkDetails?.rpcUrls,
          chainName: networkDetails?.chainName,
          nativeCurrency: networkDetails?.nativeCurrency,
          blockExplorerUrls: networkDetails?.blockExplorerUrls,
        },
      ]);
      return false;
    }
  };

  private _isNetworkSupported = async (chainId: number | null) => {
    if (chainId) {
      // check if chainId is in the supported list
      log.debug('isSupported for:', chainId);
      return SUPPORTED_NETWORKS.some(chain => chain.chainId === chainId);
    } else {
      log.debug('isNetworkSupported', this._network);
      return SUPPORTED_NETWORKS.some(
        chain => chain.chainId === this._network?.chainId
      );
    }
  };

  public isDomainNameSupported = async (chainId: number | null) => {
    log.debug(this._network?.chainId);
    log.debug(chainId);
    if (chainId) {
      return SUPPORTED_NETWORKS.some(
        chain => chain.chainId === chainId && chain.isDomainNameSupported
      );
    } else {
      const network = SUPPORTED_NETWORKS.find(
        chain => chain.chainId === this._network?.chainId
      );
      if (network) {
        return network.isDomainNameSupported;
      } else {
        return false;
      }
    }
  };

  public isUnlocked = async () => {
    const accounts: string[] = await this._provider?.send('eth_accounts', []);
    this._isUnlocked = accounts.length > 0;
    if (DISABLE_WALLET_SIGN) {
      const address = await this._provider?.getSigner()?.getAddress();
      if (address) {
        this._signerAddress = address;
      }
    }
    return this._isUnlocked;
  };

  public unlock = async () => {
    const accounts: string[] = await this._provider?.send(
      'eth_requestAccounts',
      []
    );
    this._isUnlocked = accounts.length > 0;
    this._isUnlocked = true;
    if (DISABLE_WALLET_SIGN) {
      const address = await this._provider?.getSigner()?.getAddress();
      if (address) {
        this._signerAddress = address;
      }
    }
  };

  public isSigned = async () => {
    return this._isSigned;
  };

  public sign = async (message: string | ethers.utils.Bytes) => {
    const signer = this._provider?.getSigner();
    log.debug('signer', signer);
    message += this._newUUID();
    let signature: string | undefined = undefined;
    try {
      signature = await signer?.signMessage(message);
    } catch (error: any) {
      if (error.code === MetamaskRPCErrors.ACTION_REJECTED) {
        throw new Error('sign_rejected');
      }
    }
    const address: string | undefined = await signer?.getAddress();
    this._isSigned = await this._verifyLogingSignature(
      message,
      signature,
      address
    );
    if (this._isSigned && address) {
      this._signerAddress = address;
    }
  };

  public getSigner = () => {
    return this._signerAddress;
  };

  public getProvider = () => {
    return this._provider;
  };

  // getAccount
  public getAccount = async () => {
    let result: AccountType | null = null;
    if (this._signerAddress) {
      result = {
        address: this._signerAddress,
        shortAddress:
          this._signerAddress.slice(0, 6) +
          '...' +
          this._signerAddress.slice(-4),
        domainName: null,
      };
    }
    return result;
  };

  // public getDomainName = async () => {
  //   log.debug(this._network?.chainId);
  //   if (this._provider && this._network && this._signerAddress) {
  //     if (this._network.chainId === EthereumMainnetChain.chainId) {
  //       return await this._provider.lookupAddress(this._signerAddress);
  //     } else if (this._network.chainId === AvalancheChain.chainId) {
  //       const avvyApi = LotteryAPI.getInstance(this._provider);
  //       return avvyApi.addressToDomain(this._signerAddress);
  //     }
  //   }
  // };

  // reset
  public reset = async () => {
    window.ethereum.removeAllListeners();
    this._isUnlocked = false;
    this._isSigned = false;
    this._signerAddress = null;
    this._network = null;
    return;
  };

  public listenAccountChange = (): EventChannel<string[]> | undefined => {
    if (this._accountChangeListener) {
      this._accountChangeListener.close();
      this._accountChangeListener = null;
    }
    this._accountChangeListener = eventChannel<string[]>(emit => {
      log.debug('listening for account changes');
      window.ethereum.addListener('accountsChanged', (accounts: string[]) => {
        emit(accounts);
      });

      return (): void => {
        log.debug('account listener closed');
        window.ethereum.removeListener('accountsChanged', emit);
      };
    });
    return this._accountChangeListener;
  };

  public listenNetworkChange = (): EventChannel<string> | undefined => {
    if (this._networkChangeListener) {
      this._networkChangeListener.close();
      this._networkChangeListener = null;
    }
    this._networkChangeListener = eventChannel<string>(emit => {
      log.debug('listening for network changes');
      window.ethereum.on('chainChanged', (chainId: string) => {
        emit(chainId);
      });

      return (): void => {
        log.debug('network listener closed');
        window.ethereum.removeListener('chainChanged', emit);
      };
    });
    return this._networkChangeListener;
  };

  public handleAccountChange = async () => {
    await this.reset();
  };

  public handleNetworkChange = async () => {
    await this.reset();
  };

  public getLatestBlock = async () => {
    log.debug('get latest block called');
    const blockNumber = await this._provider?.getBlockNumber();
    log.debug('block:', blockNumber);
    return blockNumber;
  };

  public getBalance = async () => {
    log.debug('get balance called');
    if (this._signerAddress) {
      const balance = await this._provider?.getBalance(this._signerAddress);
      if (balance) {
        return ethers.utils.formatEther(balance);
      }
    }
    return '';
  };

  // this is a client side secret value for signing login
  // if you have a backend application
  // you could get this value from your backend
  private _newUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // this is a client side verification for login signature
  // if you have backend, you could verify signature in your backend
  private _verifyLogingSignature = async (
    message: string | ethers.utils.Bytes,
    signature?: SignatureLike,
    address?: string
  ) => {
    if (signature && address) {
      const signerAddress: string = await ethers.utils.verifyMessage(
        message,
        signature
      );
      return signerAddress === address;
    } else {
      return false;
    }
  };
}
