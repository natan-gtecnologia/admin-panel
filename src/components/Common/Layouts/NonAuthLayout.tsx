/* eslint-disable react/jsx-no-useless-fragment */
import { useLayout } from "@/hooks/useLayout";
import { ReactNode, useEffect } from "react";

export type NonAuthLayoutProps = {
  children: ReactNode;
};

const NonAuthLayout = ({ children }: NonAuthLayoutProps) => {
  const { layoutModeType } = useLayout();

  useEffect(() => {
    if (layoutModeType === "dark") {
      document?.body.setAttribute("data-layout-mode", "dark");
    } else {
      document?.body.setAttribute("data-layout-mode", "light");
    }
    return () => {
      document?.body.removeAttribute("data-layout-mode");
    };
  }, [layoutModeType]);

  return <>{children}</>;
};

export default NonAuthLayout;
