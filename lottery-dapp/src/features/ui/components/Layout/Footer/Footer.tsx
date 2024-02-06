import React from 'react';

import { MenuType } from '@/pages/types';

import { Copyright } from '../Copyright/Copyright';
import { SocialMenu } from '../SocialMenu/SocialMenu';

import { FooterView } from './FooterView/FooterView';

export interface FooterProps {
  siteName: string;
  baseUrl: string;
  secondaryMenuItems: MenuType[];
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <FooterView
      secondRowContent={
        <>
          <Copyright />
          <SocialMenu />
        </>
      }
    />
  );
};
