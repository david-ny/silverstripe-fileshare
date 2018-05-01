import React from 'react';
import PropTypes from 'prop-types';
import LeftPane from '../LeftPane';
import RightPane from '../RightPane';
import Header from '../Header';
import {
  configPropType,
  configDefaultPropType,
  userType,
  viewPortType,
} from '../../types';

const MainLayout = ({
  user,
  config,
  viewPort,
  children,
  logout,
  toggleLeftPanel,
  toggleRightPanel,
  leftPanelActive,
  rightPanelActive,
  headerContent,
  rightPaneContent,
  ...otherProps
}) => (
  <div
    className="app"
    {...otherProps}
  >
    <LeftPane
      config={config}
      user={user}
      leftPanelActive={leftPanelActive}
      toggleLeftPanel={toggleLeftPanel}
    />
    <RightPane
      rightPanelActive={rightPanelActive}
    >
      {rightPaneContent}
    </RightPane>
    <Header
      config={config}
      user={user}
      viewPort={viewPort}
      logout={logout}
      toggleLeftPanel={toggleLeftPanel}
      toggleRightPanel={toggleRightPanel}
    >
      {headerContent}
    </Header>
    <div className="main">
      {children}
    </div>
  </div>
);

MainLayout.propTypes = {
  config: configPropType,
  user: userType.isRequired,
  viewPort: viewPortType.isRequired,
  logout: PropTypes.func.isRequired,
  toggleLeftPanel: PropTypes.func.isRequired,
  toggleRightPanel: PropTypes.func.isRequired,
  leftPanelActive: PropTypes.bool.isRequired,
  rightPanelActive: PropTypes.bool.isRequired,
  headerContent: PropTypes.node,
  rightPaneContent: PropTypes.node,
  children: PropTypes.node,
};

MainLayout.defaultProps = {
  children: null,
  config: configDefaultPropType,
  headerContent: null,
  rightPaneContent: null,
};

export default MainLayout;
