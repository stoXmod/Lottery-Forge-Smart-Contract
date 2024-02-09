import { BigNumber, Contract, ethers } from 'ethers';
import log from 'loglevel';

import { Lottery } from 'src/services/Lottery/LotteryUtils';
import { Lottery__factory } from '@/services/Lottery/LotteryUtils/Lottery__factory.ts';
import { EthersWalletAPI } from '@/services/Ethers/WalletAPI/EthersWalletAPI.ts';

const resolutionUtilsV2Address = import.meta.env.VITE_CONTRACT_ADDRESS;

export class LotteryAPI {
  private static _instance: LotteryAPI | null = null;
  private lotteryUtils: Lottery;

  private constructor(provider: ethers.providers.Web3Provider) {
    this.lotteryUtils = new Contract(
      resolutionUtilsV2Address,
      Lottery__factory.abi,
      provider.getSigner(),
    ) as unknown as Lottery;
  }

  public static getInstance(provider: ethers.providers.Web3Provider | null): LotteryAPI {
    if (!provider) {
      log.error('No provider');
      throw new Error('No provider');
    }
    if (this._instance === null) {
      log.debug('🥳 LotteryAPI init...');
      this._instance = new LotteryAPI(provider);
    }
    return this._instance;
  }

  public checkIsLotteryActive = async () => {
    return await this.lotteryUtils.lotteryActive();
  };

  private getEntryFee = async () => {
    return await this.lotteryUtils.entryFee();
  }

  public joinLottery = async () => {
    const entryFee = await this.getEntryFee();
    console.log('🤖 Entry Fee: ', entryFee);
    const signer = EthersWalletAPI.getInstance().getProvider()?.getSigner()
    if (!signer) {
      throw new Error('No signer available');
    }
    const tx =  await this.lotteryUtils.connect(signer).participate({ value: entryFee });
    await tx.wait();
  }

  public getOwner = async () => {
    return await this.lotteryUtils.owner();
  }
  public getParticipantByIndex = async () => {
    return await this.lotteryUtils.getParticipantByIndex(0);
  }

  public startNewLottery = async (entryFeeInWei: BigNumber, endTimeInSeconds: number, winnerPrizeAmountInWei: BigNumber) => {
    const signer = EthersWalletAPI.getInstance().getProvider()?.getSigner();
    if (!signer) {
      throw new Error('No signer available');
    }
    const tx = await this.lotteryUtils.connect(signer).startNewLottery(entryFeeInWei, endTimeInSeconds, winnerPrizeAmountInWei);
    await tx.wait();
  }

  public endLottery = async () => {
    const signer = EthersWalletAPI.getInstance().getProvider()?.getSigner();
    if (!signer) {
      throw new Error('No signer available');
    }
    const tx = await this.lotteryUtils.connect(signer).endLottery()
    await tx.wait();
  }
}
