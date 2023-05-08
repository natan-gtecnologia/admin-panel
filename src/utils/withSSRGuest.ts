import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { parseCookies } from 'nookies';
import { setDomainCookie } from './setDomainCookie';

export function withSSRGuest<T extends Record<string, any>>(
  fn: GetServerSideProps<T>
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<T>> => {
    await setDomainCookie(ctx);

    const cookies = parseCookies(ctx);

    if (cookies['@Admin:token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return await fn(ctx);
  };
}
