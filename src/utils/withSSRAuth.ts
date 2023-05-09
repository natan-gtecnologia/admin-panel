import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "./AuthTokenError";

export function withSSRAuth<T extends Record<string, any>>(
  fn: GetServerSideProps<T>
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx);

    if (!cookies["@liveforce:token"]) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, "@liveforce:token");
        return {
          redirect: {
            destination: "/login",
            permanent: false,
          },
        };
      }

      throw new Error("Error in ssr auth");
    }
  };
}
