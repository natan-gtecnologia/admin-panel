/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';

/* eslint-disable @typescript-eslint/ban-types */
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, logo: any) => ReactNode;
  logo?: string;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
