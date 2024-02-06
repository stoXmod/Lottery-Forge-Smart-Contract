import React from 'react';

import { Box, Button, Container, Heading, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { PageMeta } from '@/features/ui/components/PageMeta/PageMeta';

export const HomePage: React.FC = () => {
  const { t } = useTranslation('PageHome');
  const title: string = t('Lottery dApp');
  const description: string = t(
    'Welcome to the lottery app. Buy tickets and win big!'
  );
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
