import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import routeInfo from '../../Routing/RouteInfo';
import { PATH_APP_BASE } from '../../Config/constants';
import {
  configPropType,
  configDefaultPropType,
  userType,
} from '../../types';

const LeftPane = ({
  config,
  location,
  leftPanelActive,
  toggleLeftPanel,
  user,
}) => (
  <nav className={`left-side ${leftPanelActive && 'active'}`}>
    {leftPanelActive &&
      <Button
        className="close"
        onClick={toggleLeftPanel}
      >
        X
      </Button>
    }
    <a className="logo" href={PATH_APP_BASE}>
      <img src={config.app.logo.src} alt={config.app.logo.alt} />
    </a>
    <ul>
      {Object.values(routeInfo).map(item => (
        item.mainMenuItem &&
        (
          (item.adminMenuItem && user.group === 'admin')
          || (!item.adminMenuItem)
        ) &&
          <li key={item.id}>
            <Link
              to={item.segment}
              className={`${location.pathname === item.path && 'active'}`}
            >
              {item.mainTitle}
            </Link>
          </li>
      ))}
    </ul>
  </nav>
);

LeftPane.propTypes = {
  config: configPropType,
  toggleLeftPanel: PropTypes.func.isRequired,
  leftPanelActive: PropTypes.bool.isRequired,
  user: userType.isRequired,
};
LeftPane.defaultProps = {
  config: configDefaultPropType,
};

export default withRouter(props => <LeftPane {...props} />);
