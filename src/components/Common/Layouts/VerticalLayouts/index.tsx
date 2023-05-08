import React, { useEffect } from "react";
import { Collapse } from "reactstrap";

// Import Data
//i18n
import { useLayout } from "@/hooks/useLayout";
import { useRouter } from "next/router";
import { withTranslation } from "react-i18next";
import Link from "../../Link";

export type VerticalLayoutProps = {
  t: (label: string) => string;
};

const VerticalLayout = (props: VerticalLayoutProps) => {
  const {
    menuItems: navData,
    currentOpenMenuDropdown,
    handleChangeCurrentOpenMenuDropdown,
    layoutType,
  }: any = useLayout();
  const router = useRouter();

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
    if (layoutType === "vertical") {
      initMenu();
    }
  }, [router.pathname, layoutType]);

  function activateParentDropdown(item: HTMLAnchorElement) {
    item.classList.add("active");
    const parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      parentCollapseDiv.parentElement?.children[0].classList.add("active");
      parentCollapseDiv.parentElement?.children[0].setAttribute(
        "aria-expanded",
        "true"
      );
      if (parentCollapseDiv.parentElement?.closest(".collapse.menu-dropdown")) {
        parentCollapseDiv?.parentElement
          ?.closest(".collapse")
          ?.classList.add("show");
        if (
          parentCollapseDiv?.parentElement?.closest(".collapse")
            ?.previousElementSibling
        )
          parentCollapseDiv?.parentElement
            ?.closest(".collapse")
            ?.previousElementSibling?.classList.add("active");
        if (
          parentCollapseDiv?.parentElement
            ?.closest(".collapse")
            ?.previousElementSibling?.closest(".collapse")
        ) {
          parentCollapseDiv?.parentElement
            ?.closest(".collapse")
            ?.previousElementSibling?.closest(".collapse")
            ?.classList.add("show");
          parentCollapseDiv?.parentElement
            ?.closest(".collapse")
            ?.previousElementSibling?.closest(".collapse")
            ?.previousElementSibling?.classList.add("active");
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
      {/* menu Items */}
      {(navData || []).map((item: any, key: number) => {
        return (
          <React.Fragment key={key}>
            {/* Main Header */}
            {item["isHeader"] ? (
              <li className="menu-title">
                <span data-key="t-menu">{props.t(item.label)}</span>
              </li>
            ) : item.subItems ? (
              <li className="nav-item">
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    handleChangeCurrentOpenMenuDropdown(item.id);
                  }}
                  className="nav-link menu-link"
                  href={item.link ? item.link : "/#"}
                  data-bs-toggle="collapse"
                >
                  <i className={item.icon}></i>{" "}
                  <span data-key="t-apps">{props.t(item.label)}</span>
                </Link>
                <Collapse
                  className="menu-dropdown"
                  isOpen={currentOpenMenuDropdown.split("/").includes(item.id)}
                  id="sidebarApps"
                >
                  <ul className="nav nav-sm flex-column">
                    {/* subItms  */}
                    {item.subItems &&
                      (item.subItems || []).map((subItem: any, key: number) => (
                        <React.Fragment key={key}>
                          {!subItem.isChildItem ? (
                            <li className="nav-item">
                              <Link
                                href={subItem.link ? subItem.link : "/#"}
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
                                id="sidebarEcommerce"
                              >
                                <ul className="nav nav-sm flex-column">
                                  {/* child subItms  */}
                                  {subItem.childItems &&
                                    (subItem.childItems || []).map(
                                      (childItem: any, key: number) => (
                                        <React.Fragment key={key}>
                                          {!childItem.childItems ? (
                                            <li className="nav-item">
                                              <Link
                                                href={
                                                  childItem.link
                                                    ? childItem.link
                                                    : "/#"
                                                }
                                                className="nav-link"
                                              >
                                                {props.t(childItem.label)}
                                              </Link>
                                            </li>
                                          ) : (
                                            <li className="nav-item">
                                              <Link
                                                href="/#"
                                                className="nav-link"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleChangeCurrentOpenMenuDropdown(
                                                    `${item.id}/${childItem.id}`
                                                  );
                                                }}
                                                data-bs-toggle="collapse"
                                              >
                                                {props.t(childItem.label)}
                                              </Link>
                                              <Collapse
                                                className="menu-dropdown"
                                                isOpen={currentOpenMenuDropdown
                                                  .split("/")
                                                  .includes(item.id)}
                                                id="sidebaremailTemplates"
                                              >
                                                <ul className="nav nav-sm flex-column">
                                                  {childItem.childItems.map(
                                                    (
                                                      subChildItem: any,
                                                      key: number
                                                    ) => (
                                                      <li
                                                        className="nav-item"
                                                        key={key}
                                                      >
                                                        <Link
                                                          href={
                                                            subChildItem.link
                                                          }
                                                          className="nav-link"
                                                          data-key="t-basic-action"
                                                        >
                                                          {props.t(
                                                            subChildItem.label
                                                          )}{" "}
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
    </React.Fragment>
  );
};

export default withTranslation()(VerticalLayout);
