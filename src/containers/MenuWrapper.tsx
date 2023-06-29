import { LayoutDisclosureProvider } from "@/contexts/LayoutDisclosure";
import Head from "next/head";
import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
import { initialMenuItems } from "../utils/initialMenuItems";
import { ContentWrapper } from "./ContentWrapper";

export function MenuWrapper({ children }: PropsWithChildren) {
  return (
    <LayoutDisclosureProvider
      key={initialMenuItems.length}
      initialMenuItems={initialMenuItems}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />

      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ContentWrapper>{children}</ContentWrapper>
    </LayoutDisclosureProvider>
  );
}
