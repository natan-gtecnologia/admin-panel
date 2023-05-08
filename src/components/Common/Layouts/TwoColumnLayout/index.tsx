/* eslint-disable react/jsx-no-useless-fragment */
import { useRouter } from "next/router";
import { Fragment, Key, useCallback, useEffect, useState } from "react";
import { Collapse, Container } from "reactstrap";
import logoSm from "../../assets/images/logo-sm.png";

//i18n
import { withTranslation } from "react-i18next";

// Import Data

//SimpleBar
import { useLayout } from "@/hooks/useLayout";
import SimpleBar from "simplebar-react";
import Link from "../../Link";
import VerticalLayout from "../VerticalLayouts";

export type TwoColumnLayoutProps = {
  t: (label: string) => string;
};

const TwoColumnLayout = (props: TwoColumnLayoutProps) => {
  const {
    menuItems: navData,
    currentOpenMenuDropdown,
    handleChangeCurrentOpenMenuDropdown,
    layoutType,
  }: any = useLayout();
  const router = useRouter();

  const activateParentDropdown = useCallback(
    (item: {
      classList: { add: (arg0: string) => void };
      closest: (arg0: string) => any;
    }) => {
      item.classList.add("active");
      const parentCollapseDiv = item.closest(".collapse.menu-dropdown");
      if (parentCollapseDiv) {
        // to set aria expand true remaining
        parentCollapseDiv.classList.add("show");
        parentCollapseDiv.parentElement.children[0].classList.add("active");
        parentCollapseDiv.parentElement.children[0].setAttribute(
          "aria-expanded",
          "true"
        );
        if (
          parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")
        ) {
          parentCollapseDiv.parentElement
            .closest(".collapse")
            .classList.add("show");
          const parentParentCollapse =
            parentCollapseDiv.parentElement.closest(
              ".collapse"
            ).previousElementSibling;
          if (parentParentCollapse) {
            parentParentCollapse.classList.add("active");
            if (parentParentCollapse.closest(".collapse.menu-dropdown")) {
              parentParentCollapse
                .closest(".collapse.menu-dropdown")
                .classList.add("show");
            }
          }
        }
        activateIconSidebarActive(parentCollapseDiv.getAttribute("id"));
        return false;
      }
      return false;
    },
    []
  );

  const initMenu = useCallback(() => {
    const pathName = process.env["PUBLIC_URL"] + router.pathname;
    const ul = document?.getElementById("navbar-nav");
    if (!ul) return;
    const items = ul.getElementsByTagName("a");
    const itemsArray = Array.from(items); // converts NodeList to Array
    removeActivation(itemsArray);
    const matchingMenuItem = itemsArray.find((x) => {
      return x.pathname === pathName;
    });
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    } else {
      let id;
      if (process.env["PUBLIC_URL"]) {
        id = pathName.replace(process.env["PUBLIC_URL"], "");
        id = id.replace("/", "");
      } else {
        id = pathName.replace("/", "");
      }
      if (id) document?.body.classList.add("twocolumn-panel");
      activateIconSidebarActive(id);
    }
  }, [router.pathname, activateParentDropdown]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    initMenu();
  }, [router.pathname, initMenu]);

  function activateIconSidebarActive(id: string) {
    const menu = document?.querySelector(
      "#two-column-menu .simplebar-content-wrapper a[subitems='" +
        id +
        "'].nav-icon"
    );
    if (menu !== null) {
      menu.classList.add("active");
    }
  }

  const removeActivation = (items: any[]) => {
    const activeItems = items.filter((x) => x.classList.contains("active"));
    activeItems.forEach((item) => {
      if (item.classList.contains("menu-link")) {
        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", false);
        }
        item.nextElementSibling.classList.remove("show");
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", false);
      }
      item.classList.remove("active");
    });

    const ul = document?.getElementById("two-column-menu");
    if (!ul) return;
    const iconItems = ul.getElementsByTagName("a");
    const itemsArray = Array.from(iconItems);
    const activeIconItems = itemsArray.filter((x) =>
      x.classList.contains("active")
    );
    activeIconItems.forEach((item) => {
      item.classList.remove("active");
      const id = item.getAttribute("subitems");
      if (id && document?.getElementById(id))
        document?.getElementById(id)?.classList.remove("show");
    });
  };

  // Resize sidebar
  const [isMenu, setIsMenu] = useState("twocolumn");
  const windowResizeHover = () => {
    if (layoutType === "twocolumn") {
      initMenu();
      const windowSize = document?.documentElement.clientWidth;
      if (windowSize < 767) {
        document?.documentElement.setAttribute("data-layout", "vertical");
        setIsMenu("vertical");
      } else {
        document?.documentElement.setAttribute("data-layout", "twocolumn");
        setIsMenu("twocolumn");
      }
    }
  };

  useEffect(
    () => {
      window.addEventListener("resize", windowResizeHover);

      // remove classname when component will unmount
      return function cleanupListener() {
        window.removeEventListener("resize", windowResizeHover);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layoutType]
  );

  return (
    <Fragment>
      {isMenu === "twocolumn" ? (
        <div id="scrollbar">
          <Container fluid>
            <div id="two-column-menu">
              <SimpleBar className="twocolumn-iconview">
                <Link href="#" className="logo">
                  <img src={logoSm.src} alt="" height="22" />
                </Link>
                {(navData || []).map((item: any, key: Key) => (
                  <Fragment key={key}>
                    {item.icon &&
                      (item.subItems ? (
                        <li>
                          <Link
                            onClick={() =>
                              handleChangeCurrentOpenMenuDropdown(item.id)
                            }
                            href="#"
                            className="nav-icon"
                            data-bs-toggle="collapse"
                          >
                            <i className={item.icon}></i>
                          </Link>
                        </li>
                      ) : (
                        <Link
                          onClick={() =>
                            handleChangeCurrentOpenMenuDropdown(item.id)
                          }
                          href={item.link ? item.link : "/#"}
                          className="nav-icon"
                          data-bs-toggle="collapse"
                        >
                          <i className={item.icon}></i>
                        </Link>
                      ))}
                  </Fragment>
                ))}
              </SimpleBar>
            </div>
            <SimpleBar id="navbar-nav" className="navbar-nav">
              {(navData || []).map((item: any, key: Key) => (
                <Fragment key={key}>
                  {item.subItems ? (
                    <li className="nav-item">
                      <Collapse
                        className="menu-dropdown"
                        isOpen={currentOpenMenuDropdown
                          .split("/")
                          .includes(item.id)}
                        id={item.id}
                      >
                        <ul className="nav nav-sm flex-column test">
                          {/* subItms  */}
                          {item.subItems &&
                            (item.subItems || []).map(
                              (subItem: any, key: Key) => (
                                <Fragment key={key}>
                                  {!subItem.isChildItem ? (
                                    <li className="nav-item">
                                      <Link
                                        href={
                                          subItem.link ? subItem.link : "/#"
                                        }
                                        className="nav-link"
                                      >
                                        {props.t(subItem.label)}
                                        {subItem.badgeName ? (
                                          <span
                                            className={
                                              "badge badge-pill bg-" +
                                              subItem.badgeColor
                                            }
                                            data-key="t-new"
                                          >
                                            {subItem.badgeName}
                                          </span>
                                        ) : null}
                                      </Link>
                                    </li>
                                  ) : (
                                    <li className="nav-item">
                                      <Link
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleChangeCurrentOpenMenuDropdown(
                                            `${item.id}/${subItem.id}`
                                          );
                                        }}
                                        className="nav-link"
                                        href="/#"
                                        data-bs-toggle="collapse"
                                      >
                                        {" "}
                                        {props.t(subItem.label)}
                                      </Link>
                                      <Collapse
                                        className="menu-dropdown"
                                        isOpen={currentOpenMenuDropdown
                                          .split("/")
                                          .includes(subItem.id)}
                                        id={subItem.id}
                                      >
                                        <ul className="nav nav-sm flex-column">
                                          {/* child subItms  */}
                                          {subItem.childItems &&
                                            (subItem.childItems || []).map(
                                              (childItem: any, key: number) => (
                                                <li
                                                  className="nav-item"
                                                  key={key}
                                                >
                                                  <Link
                                                    href={
                                                      childItem.link
                                                        ? childItem.link
                                                        : "/#"
                                                    }
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      handleChangeCurrentOpenMenuDropdown(
                                                        `${item.id}/${subItem.id}/${childItem.id}`
                                                      );
                                                    }}
                                                    className="nav-link"
                                                  >
                                                    {props.t(childItem.label)}
                                                  </Link>
                                                  <Collapse
                                                    className="menu-dropdown"
                                                    isOpen={currentOpenMenuDropdown
                                                      .split("/")
                                                      .includes(childItem.id)}
                                                    id={item.id}
                                                  >
                                                    <ul className="nav nav-sm flex-column">
                                                      {/* child subChildItems  */}
                                                      {childItem.isChildItem &&
                                                        (
                                                          childItem.childItems ||
                                                          []
                                                        ).map(
                                                          (
                                                            childItem: any,
                                                            key: number
                                                          ) => (
                                                            <li
                                                              className="nav-item"
                                                              key={key}
                                                            >
                                                              <Link
                                                                href={
                                                                  childItem.link
                                                                    ? childItem.link
                                                                    : "/#"
                                                                }
                                                                className="nav-link"
                                                              >
                                                                {props.t(
                                                                  childItem.label
                                                                )}
                                                              </Link>
                                                            </li>
                                                          )
                                                        )}
                                                    </ul>
                                                  </Collapse>
                                                </li>
                                              )
                                            )}
                                        </ul>
                                      </Collapse>
                                    </li>
                                  )}
                                </Fragment>
                              )
                            )}
                        </ul>
                      </Collapse>
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </SimpleBar>
          </Container>
        </div>
      ) : (
        <SimpleBar id="scrollbar" className="h-100">
          <Container fluid>
            <div id="two-column-menu"></div>
            <ul className="navbar-nav" id="navbar-nav">
              <VerticalLayout />
            </ul>
          </Container>
        </SimpleBar>
      )}
    </Fragment>
  );
};

export default withTranslation()(TwoColumnLayout);
