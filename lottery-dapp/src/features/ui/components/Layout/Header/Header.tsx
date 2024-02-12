import React from 'react';

import {
  Box,
  Divider,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { IoClose, IoEllipsisVertical } from 'react-icons/io5';
import { MenuType } from '@/pages/types';

import { MainMenu } from '../MainMenu/MainMenu';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';

const ProfileMenu = React.lazy(() =>
  import(
    /* webpackChunkName: "ProfileMenu" */ '../ProfileMenu/ProfileMenu'
  ).then(module => ({
    default: module.ProfileMenu,
  }))
);

export interface HeaderProps {
  siteName: string;
  baseUrl: string;
  mainMenuItems: MenuType[];
}

export const Header: React.FC<HeaderProps> = React.memo(
  ({  mainMenuItems }) => {
    const { t } = useTranslation('Layout');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const mainMenu = (
      <MainMenu onClick={onClose} mainMenuItems={mainMenuItems} />
    );
    const toolsMenu = (
      <>
        {/*<LangMenu />*/}
        <ThemeSwitcher />
      </>
    );
    return (
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            variant="outline"
            icon={isOpen ? <IoClose /> : <IoEllipsisVertical />}
            aria-label={t('Open Menu')}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems="center">
            {/*<SiteLogo siteName={siteName} baseUrl={baseUrl} />*/}
            <HStack>
              <Text fontSize={18} fontWeight={'Bold'}>Lottery dApp with smart contract</Text>
            </HStack>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              {mainMenu}
            </HStack>
          </HStack>
          <Flex alignItems="center">
            <HStack as="nav" m={0} display={{ base: 'none', md: 'flex' }}>
              {toolsMenu}
            </HStack>
            <React.Suspense fallback={<Spinner size="xs" />}>
              <ProfileMenu />
            </React.Suspense>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={2}>
              {mainMenu}
              <Divider />
              {toolsMenu}
            </Stack>
          </Box>
        ) : null}
      </Box>
    );
  }
);
