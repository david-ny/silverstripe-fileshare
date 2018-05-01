import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import RoutedApp from './Routing';
import withLogin from './Components/withLogin';
import withViewPort from './Components/withViewPort';
import withResumable from './Components/withResumable';
import {
  configPropType,
  configDefaultPropType,
  viewPortType,
  userType,
  userDefaultPropType,
} from './types';

const App = ({
  config,
  login,
  logout,
  token,
  user,
  failedLogin,
  resumable,
  viewPort,
}) => (
  <RoutedApp
    config={config}
    viewPort={viewPort}
    resumable={resumable}
    failedLogin={failedLogin}
    login={login}
    logout={logout}
    token={token}
    user={user}
  />
);

App.propTypes = {
  config: configPropType,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  token: PropTypes.string,
  user: userType,
  failedLogin: PropTypes.bool.isRequired,
  resumable: PropTypes.object.isRequired,
  viewPort: viewPortType.isRequired,
};
App.defaultProps = {
  config: configDefaultPropType,
  token: null,
  user: userDefaultPropType,
};

export default compose(
  withLogin,
  withViewPort,
  withResumable,
)(App);
