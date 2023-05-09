import { useLayout } from "@/hooks/useLayout";
import Router from "next/router";
import { Fragment, PropsWithChildren, useEffect } from "react";

export const ContentWrapper = ({ children }: PropsWithChildren) => {
  const { handleChangeLoading } = useLayout();

  useEffect(() => {
    function routeChangeStart(page: string) {
      handleChangeLoading({
        title: "Aguarde...",
        description: "Carregando página.",
      });
    }

    function routeChangeEnd(page: string) {
      handleChangeLoading(null);
    }

    Router.events.on("routeChangeStart", routeChangeStart);
    Router.events.on("routeChangeComplete", routeChangeEnd);
    Router.events.on("routeChangeError", routeChangeEnd);

    return () => {
      handleChangeLoading(null);
      Router.events.off("routeChangeStart", routeChangeStart);
      Router.events.off("routeChangeComplete", routeChangeEnd);
      Router.events.off("routeChangeError", routeChangeEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Fragment>{children}</Fragment>;
};
