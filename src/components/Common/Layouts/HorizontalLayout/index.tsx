import React, { useEffect, useState } from "react";
import { Col, Collapse, Row } from "reactstrap";
// Import Data
//i18n
import { useLayout } from "@/hooks/useLayout";
import { useRouter } from "next/router";
import { withTranslation } from "react-i18next";
import { UrlObject } from "url";
import Link from "../../Link";

export type HorizontalLayoutProps = {
  t: (label: string) => string;
};

const HorizontalLayout = (props: HorizontalLayoutProps) => {
  const [isMoreMenu, setIsMoreMenu] = useState(false);
  const menuItems = [];
  const splitMenuItems: { [x: string]: any; subItems: any }[] = [];
  let menuSplitContainer = 6;
  const router = useRouter();
  const { menuItems: navItems, layoutType }: any = useLayout();

  navItems.forEach(function (
    value: { [x: string]: any; subItems: any },
    key: number
  ) {
    if (value["isHeader"]) {
      menuSplitContainer++;
    }
    if (key >= menuSplitContainer) {
      const val = value;
      val["childItems"] = value.subItems;
      val["isChildItem"] = value.subItems ? true : false;
      delete val.subItems;
      splitMenuItems.push(val);
    } else {
      menuItems.push(value);
    }
  });

  menuItems.push({
    id: "more",
    label: "More",
    icon: "ri-briefcase-2-line",
    link: "/#",
    stateVariables: isMoreMenu,
    subItems: splitMenuItems,
    click: function (e: { preventDefault: () => void }) {
      e.preventDefault();
      setIsMoreMenu(!isMoreMenu);
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const initMenu = () => {
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
      }
    };
    initMenu();
  }, [router.pathname, layoutType]);

  function activateParentDropdown(item: HTMLAnchorElement) {
    item.classList.add("active");
    const parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      if (!parentCollapseDiv.parentElement) return;
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      parentCollapseDiv.parentElement.children[0].setAttribute(
        "aria-expanded",
        "true"
      );
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        if (!parentCollapseDiv.parentElement.closest(".collapse")) return;
        parentCollapseDiv.parentElement
          .closest(".collapse")
          ?.classList.add("show");
        const parentElementDiv =
          parentCollapseDiv.parentElement.closest(
            ".collapse"
          )?.previousElementSibling;
        if (parentElementDiv)
          if (parentElementDiv.closest(".collapse"))
            parentElementDiv.closest(".collapse")?.classList.add("show");
        parentElementDiv?.classList.add("active");
        const parentElementSibling =
          parentElementDiv?.parentElement?.parentElement?.parentElement
            ?.previousElementSibling;
        if (parentElementSibling) {
          parentElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  const removeActivation = (items: any[]) => {
    const actiItems = items.filter((x) => x.classList.contains("active"));

    actiItems.forEach((item) => {
      if (item.classList.contains("menu-link")) {
        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", false);
        }
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", false);
      }
      item.classList.remove("active");
    });
  };

  return (
    <React.Fragment>
      {(menuItems || [])
        .filter((item) => {
          return (
            item.label !== "more" ||
            (item.label === "more" && item.subItems.length >= 1)
          );
        })
        .map((item, key) => {
          return (
            <React.Fragment key={key}>
              {/* Main Header */}
              {"isHeader" in item ? (
                <li className="menu-title">
                  <span data-key="t-menu">{props.t(item.label)}</span>
                </li>
              ) : item.subItems ? (
                <li className="nav-item">
                  {item.subItems.length === 0 ? (
                    <Link
                      onClick={item.click}
                      className="nav-link menu-link"
                      href={item.link ? item.link : "#"}
                      data-bs-toggle="collapse"
                    >
                      <i className={item.icon}></i>{" "}
                      <span data-key="t-apps">{props.t(item.label)}</span>
                    </Link>
                  ) : (
                    <span
                      onClick={item.click}
                      className="nav-link menu-link"
                      data-bs-toggle="collapse"
                    >
                      <i className={item.icon}></i>{" "}
                      <span data-key="t-apps">{props.t(item.label)}</span>
                    </span>
                  )}
                  <Collapse
                    className={
                      item.subItems.length > 13
                        ? "menu-dropdown mega-dropdown-menu"
                        : "menu-dropdown"
                    }
                    isOpen={item.stateVariables}
                    id="sidebarApps"
                  >
                    {/* subItms  */}
                    {item.subItems.length > 13 ? (
                      <Row>
                        {item.subItems &&
                          (item.subItems || []).map((subItem, key) => (
                            <React.Fragment key={key}>
                              {key % 2 === 0 ? (
                                <Col lg={4}>
                                  <ul className="nav nav-sm flex-column">
                                    <li className="nav-item">
                                      <Link
                                        href={item.subItems[key]["link"]}
                                        className="nav-link"
                                      >
                                        {item.subItems[key]["label"]}
                                      </Link>
                                    </li>
                                  </ul>
                                </Col>
                              ) : (
                                <Col lg={4}>
                                  <ul className="nav nav-sm flex-column">
                                    <li className="nav-item">
                                      <Link
                                        href={item.subItems[key]["link"]}
                                        className="nav-link"
                                      >
                                        {item.subItems[key]["label"]}
                                      </Link>
                                    </li>
                                  </ul>
                                </Col>
                              )}
                            </React.Fragment>
                          ))}
                      </Row>
                    ) : (
                      <ul className="nav nav-sm flex-column test">
                        {item.subItems &&
                          (item.subItems || []).map((subItem, key) => (
                            <React.Fragment key={key}>
                              {!subItem["isChildItem"] ? (
                                <li className="nav-item">
                                  <Link
                                    href={
                                      subItem["link"] ? subItem["link"] : "/#"
                                    }
                                    className="nav-link"
                                  >
                                    {props.t(subItem["label"])}
                                  </Link>
                                </li>
                              ) : (
                                <li className="nav-item">
                                  <Link
                                    onClick={subItem["click"]}
                                    className="nav-link"
                                    href="/#"
                                    data-bs-toggle="collapse"
                                  >
                                    {" "}
                                    {props.t(subItem["label"])}
                                  </Link>
                                  <Collapse
                                    className="menu-dropdown"
                                    isOpen={subItem["stateVariables"]}
                                    id="sidebarEcommerce"
                                  >
                                    <ul className="nav nav-sm flex-column">
                                      {/* child subItms  */}
                                      {subItem["childItems"] &&
                                        (subItem["childItems"] || []).map(
                                          (
                                            subChildItem: {
                                              isChildItem: any;
                                              link: string | UrlObject;
                                              label: string;
                                              click:
                                                | ((e: any) => void)
                                                | undefined;
                                              stateVariables:
                                                | boolean
                                                | undefined;
                                              childItems: any;
                                            },
                                            key: React.Key | null | undefined
                                          ) => (
                                            <React.Fragment key={key}>
                                              {!subChildItem.isChildItem ? (
                                                <li className="nav-item">
                                                  <Link
                                                    href={
                                                      subChildItem.link
                                                        ? subChildItem.link
                                                        : "/#"
                                                    }
                                                    className="nav-link"
                                                  >
                                                    {props.t(
                                                      subChildItem.label
                                                    )}
                                                  </Link>
                                                </li>
                                              ) : (
                                                <li className="nav-item">
                                                  <Link
                                                    onClick={subChildItem.click}
                                                    className="nav-link"
                                                    href="/#"
                                                    data-bs-toggle="collapse"
                                                  >
                                                    {" "}
                                                    {props.t(
                                                      subChildItem.label
                                                    )}
                                                  </Link>
                                                  <Collapse
                                                    className="menu-dropdown"
                                                    isOpen={
                                                      subChildItem.stateVariables
                                                    }
                                                    id="sidebarEcommerce"
                                                  >
                                                    <ul className="nav nav-sm flex-column">
                                                      {/* child subItms  */}
                                                      {subChildItem.childItems &&
                                                        (
                                                          subChildItem.childItems ||
                                                          []
                                                        ).map(
                                                          (
                                                            subSubChildItem: {
                                                              link:
                                                                | string
                                                                | UrlObject;
                                                              label: string;
                                                            },
                                                            key:
                                                              | React.Key
                                                              | null
                                                              | undefined
                                                          ) => (
                                                            <li
                                                              className="nav-item apex"
                                                              key={key}
                                                            >
                                                              <Link
                                                                href={
                                                                  subSubChildItem.link
                                                                    ? subSubChildItem.link
                                                                    : "/#"
                                                                }
                                                                className="nav-link"
                                                              >
                                                                {props.t(
                                                                  subSubChildItem.label
                                                                )}
                                                              </Link>
                                                            </li>
                                                          )
                                                        )}
                                                    </ul>
                                                  </Collapse>
                                                </li>
                                              )}
                                            </React.Fragment>
                                          )
                                        )}
                                    </ul>
                                  </Collapse>
                                </li>
                              )}
                            </React.Fragment>
                          ))}
                      </ul>
                    )}
                  </Collapse>
                </li>
              ) : (
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link"
                    href={item.link ? item.link : "/#"}
                  >
                    <i className={item.icon}></i>{" "}
                    <span>{props.t(item.label)}</span>
                  </Link>
                </li>
              )}
            </React.Fragment>
          );
        })}
      {/* menu Items */}
    </React.Fragment>
  );
};

export default withTranslation()(HorizontalLayout);
