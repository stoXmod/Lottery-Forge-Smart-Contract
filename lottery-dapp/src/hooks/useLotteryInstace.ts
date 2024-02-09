import { useEffect, useState } from 'react';
import { LotteryAPI } from '@/services/Lottery/LotteryAPI';
import { EthersWalletAPI } from '@/services/Ethers/WalletAPI/EthersWalletAPI';
import { useWalletAuthentication } from '@/features/wallet/hooks/useWalletAuthentication';

const useLotteryInstance = () => {
  const signer = EthersWalletAPI.getInstance().getSigner();
  const [error, setError] = useState<string | null>(null);
  const [lotteryInstance, setLotteryInstance] = useState<LotteryAPI | null>(null);
  const { isAuthenticated } = useWalletAuthentication();

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Wallet not authenticated');
      setLotteryInstance(null);
      return;
    }

    const instance = LotteryAPI.getInstance(EthersWalletAPI.getInstance().getProvider());
    setLotteryInstance(instance);
    setError(null);
  }, [isAuthenticated]);

  return { lotteryInstance, error , signer};
}

export default useLotteryInstance;
