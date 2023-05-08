import { GetServerSidePropsContext, PreviewData } from "next";
import { setCookie } from "nookies";
import { ParsedUrlQuery } from "querystring";
import { Config } from "../contexts/SettingsContext/config";

export const setDomainCookie = async (ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) => {
    const url = ctx.req.headers.host
    const configAdmin = Config[url];

    if (!configAdmin) throw new Error("no domain found!");

    setCookie(ctx, '@Admin:configPanel', configAdmin?.base_url, {
        path: '/'
    });

    setCookie(ctx, '@Admin:AdminPanel', JSON.stringify(configAdmin))
}