import React, { useEffect } from "react";
import SimpleBar from "simplebar-react";
//import logo
import LogoDark from "@/assets/svgs/liveforce-logo-dark.svg";
import LogoLight from "@/assets/svgs/liveforce-logo-light.svg";

//Import Components
import { useLayout } from "@/hooks/useLayout";
import { Container } from "reactstrap";
import Link from "../Link";
import HorizontalLayout from "./HorizontalLayout";
import TwoColumnLayout from "./TwoColumnLayout";
import VerticalLayout from "./VerticalLayouts";

const Sidebar = ({ logo }: any) => {
  const { layoutType } = useLayout();

  useEffect(() => {
    const verticalOverlay =
      document?.getElementsByClassName("vertical-overlay");
    if (verticalOverlay) {
      verticalOverlay[0].addEventListener("click", function () {
        document?.body.classList.remove("vertical-sidebar-enable");
      });
    }
  }, []);

  const addEventListenerOnSmHoverMenu = () => {
    // add listener Sidebar Hover icon on change layout from setting
    if (
      document?.documentElement.getAttribute("data-sidebar-size") === "sm-hover"
    ) {
      document?.documentElement.setAttribute(
        "data-sidebar-size",
        "sm-hover-active"
      );
    } else if (
      document?.documentElement.getAttribute("data-sidebar-size") ===
      "sm-hover-active"
    ) {
      document?.documentElement.setAttribute("data-sidebar-size", "sm-hover");
    } else {
      document?.documentElement.setAttribute("data-sidebar-size", "sm-hover");
    }
  };
  return (
    <React.Fragment>
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box">
          <Link href="/" className="logo logo-dark">
            <span className="logo-sm">
              <LogoDark />
            </span>
            <span className="logo-lg">
              <LogoDark />
            </span>
          </Link>

          <Link href="/" className="logo logo-light">
            <span className="logo-sm">
              <LogoLight />
            </span>
            <span className="logo-lg">
              <LogoLight />
            </span>
          </Link>
          <button
            onClick={addEventListenerOnSmHoverMenu}
            type="button"
            className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
          >
            <i className="ri-record-circle-line"></i>
          </button>
        </div>
        {layoutType === "horizontal" ? (
          <div id="scrollbar">
            <Container fluid>
              <div id="two-column-menu"></div>
              <ul className="navbar-nav" id="navbar-nav">
                <HorizontalLayout />
              </ul>
            </Container>
          </div>
        ) : layoutType === "twocolumn" ? (
          <React.Fragment>
            <TwoColumnLayout />
            <div className="sidebar-background"></div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <SimpleBar id="scrollbar" className="h-100">
              <Container fluid>
                <div id="two-column-menu"></div>
                <ul className="navbar-nav" id="navbar-nav">
                  <VerticalLayout />
                </ul>
              </Container>
            </SimpleBar>
            <div className="sidebar-background"></div>
          </React.Fragment>
        )}
      </div>
      <div className="vertical-overlay"></div>
    </React.Fragment>
  );
};

export default Sidebar;
