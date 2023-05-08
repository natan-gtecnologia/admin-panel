import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { Config } from '../contexts/SettingsContext/config';
import { AuthTokenError } from './AuthTokenError';
import { setDomainCookie } from './setDomainCookie';

export function withSSRAuth<T extends Record<string, any>>(
  fn: GetServerSideProps<T>
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<T>> => {
    await setDomainCookie(ctx);
    const cookies = parseCookies(ctx);

    if (!cookies['@Admin:token']) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, '@Admin:token');
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      throw new Error('Error in ssr auth');
    }
  };
}
