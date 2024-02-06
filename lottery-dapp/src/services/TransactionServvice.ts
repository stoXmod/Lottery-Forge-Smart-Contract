import { ethers } from 'ethers';
import { contract_ABI, contractAddress } from '../utils/constants';

export const TransactionContextAbstract = {
  getNFTContract: () => {
    const { ethereum } = window;
    console.log('ethers...');
    const provider = new ethers.providers.Web3Provider(ethereum);
    console.log({ provider });
    const signer = provider.getSigner();

    const transactionContract = new ethers.Contract(
      contractAddress,
      contract_ABI,
      signer
    );

    console.log(transactionContract);

    return transactionContract;
  }
};
