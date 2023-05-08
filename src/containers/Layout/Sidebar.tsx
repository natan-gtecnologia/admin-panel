import Link from '@growth/growforce-admin-ui/components/Common/Link';
import React, { useEffect } from 'react';
import SimpleBar from 'simplebar-react';
//import logo
import logoDark from '@growth/growforce-admin-ui/assets/images/logo-dark.png';
import logoLight from '@growth/growforce-admin-ui/assets/images/logo-light.png';

//Import Components
import HorizontalLayout from '@growth/growforce-admin-ui/Layouts/HorizontalLayout';
import TwoColumnLayout from '@growth/growforce-admin-ui/Layouts/TwoColumnLayout';
import VerticalLayout from '@growth/growforce-admin-ui/Layouts/VerticalLayouts';
import { useLayout } from '@growth/growforce-admin-ui/hooks/useLayout';
import Image from 'next/image';
import { Container } from 'reactstrap';
import { useSettings } from '../../contexts/SettingsContext';

const Sidebar = () => {
  const { layoutType } = useLayout();
  const { config } = useSettings();

  useEffect(() => {
    const verticalOverlay =
      document?.getElementsByClassName('vertical-overlay');
    if (verticalOverlay) {
      verticalOverlay[0].addEventListener('click', function () {
        document?.body.classList.remove('vertical-sidebar-enable');
      });
    }
  }, []);

  const addEventListenerOnSmHoverMenu = () => {
    // add listener Sidebar Hover icon on change layout from setting
    if (
      document?.documentElement.getAttribute('data-sidebar-size') === 'sm-hover'
    ) {
      document?.documentElement.setAttribute(
        'data-sidebar-size',
        'sm-hover-active',
      );
    } else if (
      document?.documentElement.getAttribute('data-sidebar-size') ===
      'sm-hover-active'
    ) {
      document?.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      document?.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    }
  };
  return (
    <React.Fragment>
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box">
          <Link href="/" className="logo logo-dark">
            <span className="logo-sm">
              <Image
                src={
                  config?.logoSidebar ? String(config?.logoSidebar) : logoDark
                }
                alt=""
                width={50}
                height="30"
              />
            </span>
            <span className="logo-lg">
              <Image
                src={
                  config?.logoSidebar ? String(config?.logoSidebar) : logoLight
                }
                alt=""
                width={50}
                height="30"
              />
            </span>
          </Link>

          <Link href="/" className="logo logo-light">
            <span className="logo-sm">
              <Image
                src={
                  config?.logoSidebar ? String(config?.logoSidebar) : logoLight
                }
                alt=""
                width={50}
                height="30"
              />
            </span>
            <span className="logo-lg">
              <Image
                src={
                  config?.logoSidebar ? String(config?.logoSidebar) : logoLight
                }
                alt=""
                width={50}
                height="30"
              />
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
        {layoutType === 'horizontal' ? (
          <div id="scrollbar">
            <Container fluid>
              <div id="two-column-menu"></div>
              <ul className="navbar-nav" id="navbar-nav">
                <HorizontalLayout />
              </ul>
            </Container>
          </div>
        ) : layoutType === 'twocolumn' ? (
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
