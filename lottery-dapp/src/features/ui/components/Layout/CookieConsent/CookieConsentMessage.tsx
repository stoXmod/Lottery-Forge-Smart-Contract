import { Button, Text } from '@chakra-ui/react';
import { CookieConsent } from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';

export interface CookieConsentMessageProps {
  debug?: boolean;
  expires?: number;
}

export const CookieConsentMessage: React.FC<CookieConsentMessageProps> = ({
  debug = false,
  expires = 365,
}) => {
  const { t } = useTranslation('Layout');
  return (
    <CookieConsent
      location="bottom"
      enableDeclineButton
      ButtonComponent={Button}
      buttonText={t('Accept all cookies')}
      declineButtonText={t('Refuse non-essential cookies')}
      style={{
        opacity: '0.8',
        marginBottom: '1rem',
      }}
      expires={expires}
      debug={debug}
    >
      <Text>
        {t('This website uses cookies to enhance the user experience.')}
      </Text>
    </CookieConsent>
  );
};
