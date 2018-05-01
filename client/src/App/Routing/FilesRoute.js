import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import routeInfo from './RouteInfo';
import {
  configPropType,
  configDefaultPropType,
  userType,
  viewPortType,
} from '../types';

const FilesRoute = ({
  component: FilesPageContainer,
  config,
  viewPort,
  logout,
  token,
  user,
  mainTitle,
  resumable,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => (
      (!token || (token === null && user))
      ? (
        <Redirect
          to={{
            pathname: routeInfo.login.path,
            state: { from: props.location },
          }}
        />
      )
      : (
        <FilesPageContainer
          displayUsers={false}
          config={config}
          resumable={resumable}
          viewPort={viewPort}
          logout={logout}
          token={token}
          user={user}
          mainTitle={mainTitle}
          {...props}
        />
      )
    )}
  />
);

FilesRoute.propTypes = {
  component: PropTypes.func.isRequired,
  config: configPropType,
  mainTitle: PropTypes.string.isRequired,
  // login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  user: userType,
  token: PropTypes.string,
  viewPort: viewPortType.isRequired,
  resumable: PropTypes.object.isRequired,
  location: PropTypes.object,
};
FilesRoute.defaultProps = {
  config: configDefaultPropType,
  token: null,
  user: null,
};

export default FilesRoute;
