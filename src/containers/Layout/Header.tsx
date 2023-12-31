import { useState } from "react";
import { Dropdown, DropdownMenu, DropdownToggle, Form } from "reactstrap";

//import images

//import Components
//import NotificationDropdown from '@growth/growforce-admin-ui/components/Common/NotificationDropdown';
import FullScreenDropdown from "@/components/Common/FullScreenDropdown";
import LightDark from "@/components/Common/LightDark";
import Link from "@/components/Common/Link";
import Image from "next/image";
import ProfileDropdown from "./ProfileDropdown";

export type HeaderProps = {
  headerClass: string;
  logo: any;
};

const Header = ({ headerClass, logo }: HeaderProps) => {
  const [search, setSearch] = useState(false);
  const toogleSearch = () => {
    setSearch(!search);
  };

  const toogleMenuBtn = () => {
    const windowSize = document?.documentElement.clientWidth;

    if (windowSize > 767)
      document?.querySelector(".hamburger-icon")?.classList.toggle("open");

    //For collapse horizontal menu
    if (
      document?.documentElement.getAttribute("data-layout") === "horizontal"
    ) {
      document?.body.classList.contains("menu")
        ? document?.body.classList.remove("menu")
        : document?.body.classList.add("menu");
    }

    //For collapse vertical menu
    if (document?.documentElement.getAttribute("data-layout") === "vertical") {
      if (windowSize < 1025 && windowSize > 767) {
        document?.body.classList.remove("vertical-sidebar-enable");
        document?.documentElement.getAttribute("data-sidebar-size") === "sm"
          ? document?.documentElement.setAttribute("data-sidebar-size", "")
          : document?.documentElement.setAttribute("data-sidebar-size", "sm");
      } else if (windowSize > 1025) {
        document?.body.classList.remove("vertical-sidebar-enable");
        document?.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document?.documentElement.setAttribute("data-sidebar-size", "sm")
          : document?.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize <= 767) {
        document?.body.classList.add("vertical-sidebar-enable");
        document?.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }

    //Two column menu
    if (document?.documentElement.getAttribute("data-layout") === "twocolumn") {
      document?.body.classList.contains("twocolumn-panel")
        ? document?.body.classList.remove("twocolumn-panel")
        : document?.body.classList.add("twocolumn-panel");
    }
  };

  return (
    <header id="page-topbar" className={headerClass}>
      <div className="layout-width">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box horizontal-logo">
              <Link href="/" className="logo logo-dark">
                <span className="logo-sm">
                  <Image
                    src={logo}
                    alt=""
                    style={{
                      filter:
                        "invert(48%) sepia(13%) saturate(3207%) hue-rotate(130deg) brightness(95%) contrast(80%)",
                    }}
                  />
                </span>
                <span className="logo-lg">
                  <Image
                    src={logo}
                    alt=""
                    style={{
                      filter:
                        "invert(48%) sepia(13%) saturate(3207%) hue-rotate(130deg) brightness(95%) contrast(80%)",
                    }}
                  />
                </span>
              </Link>

              <Link href="/" className="logo logo-light">
                <span className="logo-sm">
                  <Image
                    src={logo}
                    alt=""
                    style={{
                      filter:
                        "invert(48%) sepia(13%) saturate(3207%) hue-rotate(130deg) brightness(95%) contrast(80%)",
                    }}
                  />
                </span>
                <span className="logo-lg">
                  <Image
                    src={logo}
                    alt=""
                    style={{
                      filter:
                        "invert(48%) sepia(13%) saturate(3207%) hue-rotate(130deg) brightness(95%) contrast(80%)",
                    }}
                  />
                </span>
              </Link>
            </div>

            <button
              onClick={toogleMenuBtn}
              type="button"
              className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger shadow-none"
              id="topnav-hamburger-icon"
            >
              <span className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

            {/*<SearchOption />*/}
          </div>

          <div className="d-flex align-items-center">
            <Dropdown
              isOpen={search}
              toggle={toogleSearch}
              className="d-md-none topbar-head-dropdown header-item"
            >
              <DropdownToggle
                type="button"
                tag="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
              >
                <i className="bx bx-search fs-22"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                <Form className="p-3">
                  <div className="form-group m-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search ..."
                        aria-label="Recipient's username"
                      />
                      <button className="btn btn-primary" type="submit">
                        <i className="mdi mdi-magnify"></i>
                      </button>
                    </div>
                  </div>
                </Form>
              </DropdownMenu>
            </Dropdown>

            {/* FullScreenDropdown */}
            <FullScreenDropdown />

            {/* Dark/Light Mode set */}
            <LightDark />

            {/* NotificationDropdown */}
            {/*<NotificationDropdown />*/}

            {/* ProfileDropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
