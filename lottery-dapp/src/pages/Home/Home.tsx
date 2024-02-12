import React, { useEffect, useState } from 'react';

import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { PageMeta } from '@/features/ui/components/PageMeta/PageMeta';
import useLotteryInstance from '@/hooks/useLotteryInstace';
import { ConnectButton } from '@/features/wallet/components/ConnectButton/ConnectButton';
import { useWalletAuthentication } from '@/features/wallet/hooks/useWalletAuthentication';
import { ethers } from 'ethers';

export const HomePage: React.FC = () => {
  const {lotteryInstance, signer} = useLotteryInstance()
  const [isOwner, setIsOwner] = useState(false)
  const { isAuthenticated } = useWalletAuthentication();
  const [isLotteryActive, setIsLotteryActive] = React.useState<boolean>(false)
  const { t } = useTranslation('PageHome');
  const title: string = t('Lottery dApp');
  const description: string = t(
    'Welcome to the lottery app. Buy tickets and win big!'
  );

  useEffect(() => {
    checkIsLotteryActive().then()
  }, [lotteryInstance]);

  const checkIsLotteryActive = async() => {
    if (lotteryInstance) {
      const isActive =  await lotteryInstance.checkIsLotteryActive()
      const isOwner = await lotteryInstance.getOwner() === signer
      if(isOwner) {
        setIsOwner(true)
      }else{
        setIsOwner(false)
      }
      setIsLotteryActive(isActive)
    }
  }

  const joinLottery = async() => {
    if(lotteryInstance) {
      try{
      await lotteryInstance.joinLottery()
        alert('You have successfully joined the lottery ✅!')
      }catch(ex){
         alert((ex as any).data.message)
      }
    }
  }
  const endLottery = async() => {
    if(lotteryInstance) {
      try{
      await lotteryInstance.endLottery()
        alert('Lottery ended successfully ✅!')
      }catch(ex){
         alert((ex as any).data.message)
      }
    }
  }
  const startLottery = async() => {
    if(lotteryInstance) {
      if (!signer) return alert('Please connect your wallet!')
      try{
        const entryFeeInEther = "0.01";
        const entryFeeInWei = ethers.utils.parseEther(entryFeeInEther);
        const winnerPrizeAmount = ethers.utils.parseEther("0.1");
        await lotteryInstance.startNewLottery(entryFeeInWei, 3600, winnerPrizeAmount)
        alert('Lottery started successfully ✅!')
      }catch(ex){
         alert((ex as any).data.message)
      }
    }
  }


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
          {
            isAuthenticated ? (
              <>
              {isOwner ? (
                <>
                  <Text fontWeight={600} fontSize={25}> ----- Admin Page -----</Text>
                  {isLotteryActive && <Button onClick={() => endLottery()}>End Current Lottery</Button>}
                  <Button onClick={() => startLottery()}>Start Lottery</Button>
                </>
                ) : (
                isLotteryActive ? (
                  <><Text fontWeight={600}
                          fontSize={{ base: '1xl', sm: '2xl', md: '3xl' }}
                          lineHeight="110%"
                          textAlign="center">
                    {t('A Lottery is active. Join Now!!!')}
                  </Text><Button onClick={() => joinLottery()}>Join Now</Button></>
                ) : (
                  <><Text fontWeight={600}
                          fontSize={{ base: '1xl', sm: '2xl', md: '3xl' }}
                          lineHeight="110%"
                          textAlign="center">
                    {t('No any lottery is active right now. Please wait for the next lottery.')}
                  </Text></>
                )
                )}
              </>
            ) : <>
            <Heading
                fontWeight={600}
                fontSize={{ base: '1xl', sm: '2xl', md: '3xl' }}
                lineHeight="110%"
                textAlign="center"
              >
                {t('Welcome to the lottery app')}
              </Heading>
              <ConnectButton />
            </>
          }
        </Stack>
      </Container>
    </>
  );
};
