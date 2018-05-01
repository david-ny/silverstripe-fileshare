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

const LoginRoute = ({
  component: LoginForm,
  config,
  viewPort,
  login,
  logout,
  token,
  failedLogin,
  user,
  mainTitle,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => (
      (token && (token !== null && user))
      ? (
        <Redirect
          to={{
            pathname: routeInfo.files.path,
            state: { from: props.location },
          }}
        />
      )
      : (
        <LoginForm
          config={config}
          viewPort={viewPort}
          login={login}
          logout={logout}
          failedLogin={failedLogin}
          token={token}
          user={user}
          mainTitle={mainTitle}
          {...props}
        />
      )
    )}
  />
);

LoginRoute.propTypes = {
  component: PropTypes.func.isRequired,
  config: configPropType,
  mainTitle: PropTypes.string.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  failedLogin: PropTypes.bool.isRequired,
  user: userType,
  token: PropTypes.string,
  viewPort: viewPortType.isRequired,
  location: PropTypes.object,
};
LoginRoute.defaultProps = {
  config: configDefaultPropType,
  token: null,
  user: null,
};


export default LoginRoute;
