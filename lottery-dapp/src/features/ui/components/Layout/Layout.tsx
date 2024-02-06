import React, { ErrorInfo } from 'react';

import { Box, ChakraProvider, ScaleFade } from '@chakra-ui/react';
import log from 'loglevel';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

import { useI18nWatcher } from '@/features/i18n/useI18nWatchers';
import { usePageLink } from '@/pages/usePageLink';
import { usePages } from '@/pages/usePages';
import { ErrorFallback } from './ErrorFallback/ErrorFallback';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import { PageLoading } from './PageLoding/PageLoading';
import { ScrollToTopButton } from './ScrollToTopButton/ScrollToTopButton';
import { SiteMeta } from './SiteMeta/SiteMeta';
import { theme } from './Theme/theme';

const myErrorHandler = (error: Error, info: ErrorInfo) => {
  // Do something with the error
  // E.g. log to an error logging client here
  log.error(error.message);
  log.error(info.componentStack);
};

export const Layout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation('Layout');
  useI18nWatcher();
  const { pageLink } = usePageLink();
  const { mainMenuItems, secondaryMenuItems } = usePages();
  const siteName = t('SITE_NAME');
  const siteDescription = t('SITE_DESCRIPTION');

  const baseUrl = pageLink('/');

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
        <HelmetProvider>
          <SiteMeta siteName={siteName} siteDescription={siteDescription} />
          <Box minH="100vh" flexDirection="column" display="flex">
            <Header
              siteName={siteName}
              baseUrl={baseUrl}
              mainMenuItems={mainMenuItems}
            />
            <Box p={0} flex={1}>
              <React.Suspense fallback={<PageLoading />}>
                <ScaleFade key={location.pathname} initialScale={0.9} in={true}>
                  <Outlet />
                </ScaleFade>
              </React.Suspense>
            </Box>
            <Footer
              siteName={siteName}
              baseUrl={baseUrl}
              secondaryMenuItems={secondaryMenuItems}
            />
            <ScrollToTopButton />
            {/*<CookieConsentMessage />*/}
          </Box>
        </HelmetProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
};
