import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import FilesPageContainer from '../FilesPageComponents/FilesPageContainer';
import LoginPage from '../Components/LoginPage';
import routeInfo from './RouteInfo';
import MainRoute from './MainRoute';
import LoginRoute from './LoginRoute';
import FilesRoute from './FilesRoute';
import AllFilesRoute from './AllFilesRoute';
import {
  configPropType,
  configDefaultPropType,
  userType,
  viewPortType,
} from '../types';

const RoutedApp = ({
  config,
  viewPort,
  login,
  logout,
  failedLogin,
  token,
  user,
  resumable,
}) => {
  const commonProps = {
    config,
    viewPort,
    token,
    user,
    logout,
  };
  return (
    <Router>
      <div>
        <MainRoute
          exact
          path={`/${config.app.appPath}/`}
          token={token}
          user={user}
          {...commonProps}
        />
        <LoginRoute
          path={routeInfo.login.path}
          component={LoginPage}
          login={login}
          failedLogin={failedLogin}
          mainTitle={routeInfo.login.mainTitle}
          {...commonProps}
        />
        <FilesRoute
          path={routeInfo.files.path}
          component={FilesPageContainer}
          displayUsers={false}
          resumable={resumable}
          mainTitle={routeInfo.files.mainTitle}
          {...commonProps}
        />
        <AllFilesRoute
          path={routeInfo.allfiles.path}
          component={FilesPageContainer}
          mainTitle={routeInfo.allfiles.mainTitle}
          displayUsers
          resumable={resumable}
          {...commonProps}
        />
      </div>
    </Router>
  );
};

RoutedApp.propTypes = {
  config: configPropType,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  user: userType,
  token: PropTypes.string,
  failedLogin: PropTypes.bool.isRequired,
  viewPort: viewPortType.isRequired,
  resumable: PropTypes.object.isRequired,
};
RoutedApp.defaultProps = {
  config: configDefaultPropType,
  token: null,
  user: null,
};

export default RoutedApp;
