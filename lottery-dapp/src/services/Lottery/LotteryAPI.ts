import { Contract, ethers } from 'ethers';
import log from 'loglevel';

import { Lottery } from 'src/services/Lottery/LotteryUtils';
import { Lottery__factory } from '@/services/Lottery/LotteryUtils/Lottery__factory.ts';

const resolutionUtilsV2Address = '0x8E5E0922525A514Fe5168226Cc9CC0bbb7A95b38';

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
    return await this.lotteryUtils.lotteryActive()
  };

  //
  // public domainToAddress = async (domain: string) => {
  //   const address = await this.lotteryUtils.resolveStandard(domain, 3);
  //   log.debug(address);
  //   return address;
  // };
}
