import { QueryClientProvider } from "@tanstack/react-query";
import Aos from "aos";
import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "aos/dist/aos.css";
import "react-toastify/dist/ReactToastify.min.css";

import "@/assets/scss/themes.scss";
// Fake Backend

import { AppPropsWithLayout } from "../@types/next";

import Head from "next/head";
import logo from "../../public/svg/logo.webp";
import { MenuWrapper } from "../containers/MenuWrapper";
import { queryClient } from "../services/react-query";

function CustomApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    Aos.init({
      easing: "ease-out-back",
      duration: 3000,
      anchorPlacement: "top-bottom",
    });

    return () => {
      Aos.refresh();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Admin</title>
      </Head>
      <DndProvider backend={HTML5Backend}>
        <QueryClientProvider client={queryClient}>
          <MenuWrapper>
            {getLayout(<Component {...pageProps} />, logo)}
          </MenuWrapper>
        </QueryClientProvider>
      </DndProvider>
    </>
  );
}

export default CustomApp;
