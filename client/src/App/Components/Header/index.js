import React from 'react';
import PropTypes from 'prop-types';
import { Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
  configPropType,
  configDefaultPropType,
  userType,
  viewPortType,
} from '../../types';

const Header = ({
  config,
  viewPort,
  user,
  children,
  logout,
  toggleLeftPanel,
  toggleRightPanel,
}) => (
  <header className="header">
    <h1>
      {viewPort.isSmall &&
        <Button
          color="link"
          className="left-panel-trigger"
          onClick={toggleLeftPanel}
        >
          <span className="ti-menu" />
        </Button>
      }
      {children}
    </h1>

    <div className="search-and-account">
      {/* <a href="nope" className="notif"><img src={`${config.app.imagePath}/bell.svg`} alt="bell" /></a> */}
      <UncontrolledDropdown>
        <DropdownToggle caret className="user-menu-trigger">
          <img src={`${config.app.imagePath}/user.svg`} alt="user" />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>{`${user.email}`}</DropdownItem>
          <DropdownItem divider />
          <DropdownItem onClick={logout}>Logout</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
      {viewPort.isSmall &&
        <Button
          className="right-panel-trigger"
          onClick={toggleRightPanel}
        >
        ...
        </Button>
      }

    </div>
  </header>
);

Header.propTypes = {
  config: configPropType,
  user: userType.isRequired,
  viewPort: viewPortType.isRequired,
  logout: PropTypes.func.isRequired,
  toggleLeftPanel: PropTypes.func.isRequired,
  toggleRightPanel: PropTypes.func.isRequired,
  children: PropTypes.node,
};
Header.defaultProps = {
  config: configDefaultPropType,
  children: null,
};

export default Header;
