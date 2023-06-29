/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

//import images
const ProfileDropdown = () => {
  //Dropdown Toggle
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-3 header-item topbar-user"
      >
        <DropdownToggle tag="button" type="button" className="btn shadow-none">
          <span className="d-flex align-items-center">
            <div className="header-profile-user">
              <span className="avatar-title bg-soft-primary text-primary rounded-circle fs-5">
                teste
              </span>
            </div>
            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                teste
              </span>
              {/*<span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                Founder
              </span>*/}
            </span>
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <h6 className="dropdown-header">Bem-vindo(a) teste!</h6>
          {/*<DropdownItem href="/profile">
            <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
            <span className="align-middle">Perfil</span>
          </DropdownItem>
          <div className="dropdown-divider"></div>*/}
          {/*<DropdownItem href="/pages-profile-settings">
            <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>{' '}
            <span className="align-middle">Configurações</span>
          </DropdownItem>*/}
          {/*<DropdownItem href="/auth-lockscreen-basic">
            <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>{' '}
            <span className="align-middle">Lock screen</span>
          </DropdownItem>*/}
          <DropdownItem onClick={() => {}}>
            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{' '}
            <span className="align-middle" data-key="t-logout">
              Sair
            </span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default ProfileDropdown;
