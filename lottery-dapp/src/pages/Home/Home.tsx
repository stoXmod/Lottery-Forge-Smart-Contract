import React, { useEffect } from 'react';

import { Box, Button, Container, Heading, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { PageMeta } from '@/features/ui/components/PageMeta/PageMeta';
import { useWalletAuthentication } from '@/features/wallet/hooks/useWalletAuthentication.ts';
import { LotteryAPI } from '@/services/Lottery/LotteryAPI.ts';
import { EthersWalletAPI } from '@/services/Ethers/WalletAPI/EthersWalletAPI.ts';

export const HomePage: React.FC = () => {
  const { t } = useTranslation('PageHome');
  const title: string = t('Lottery dApp');
  const description: string = t(
    'Welcome to the lottery app. Buy tickets and win big!'
  );
  const { isAuthenticated } = useWalletAuthentication();

  useEffect(() => {
    if (!isAuthenticated) return;
    const lotteryInstance = LotteryAPI.getInstance(EthersWalletAPI.getInstance().getProvider())
    lotteryInstance.checkIsLotteryActive().then((res)=> console.log(res))
  }, [isAuthenticated]);

  return (
    <>
      <PageMeta title={title} description={description} url="" />
      <Container maxW="3xl">
        <Stack
          as={Box}
          textAlign="center"
          spacing={{ base: 2, md: 4 }}
          py={{ base: 10, md: 16 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '1xl', sm: '2xl', md: '3xl' }}
            lineHeight="110%"
            textAlign="center"
          >
            {t('Welcome to the lottery app')}
          </Heading>
          <Button>Join to a game</Button>
        </Stack>
      </Container>
    </>
  );
};
