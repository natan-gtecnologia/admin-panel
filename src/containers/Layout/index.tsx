import React, { ReactNode, useEffect, useState } from 'react';

//import Components
import RightSidebar from '@growth/growforce-admin-ui/components/Common/RightSidebar';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSettings } from '../../contexts/SettingsContext';

//import actions

export type LayoutProps = {
  children: ReactNode;
  logo: any;
};

const Layout = (props: LayoutProps) => {
  const [headerClass, setHeaderClass] = useState('');

  // class add remove in header
  useEffect(() => {
    window.addEventListener('scroll', scrollNavigation, true);
  }, []);

  function scrollNavigation() {
    const scrollup = document?.documentElement.scrollTop;
    if (scrollup > 50) {
      setHeaderClass('topbar-shadow');
    } else {
      setHeaderClass('');
    }
  }

  return (
    <React.Fragment>
      <div id="layout-wrapper" className="overflow-hidden">
        <Header headerClass={headerClass} logo={props.logo} />
        <Sidebar />
        <div className="main-content">
          {props.children}
          <Footer />
        </div>
      </div>
      <RightSidebar />
    </React.Fragment>
  );
};

export default Layout;
