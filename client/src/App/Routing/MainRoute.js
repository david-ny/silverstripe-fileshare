import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import routeInfo from './RouteInfo';
import {
  userType,
} from '../types';

const MainRoute = ({
  token,
  user,
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
        <Redirect
          to={{
            pathname: routeInfo.login.path,
            state: { from: props.location },
          }}
        />
      )
    )}
  />
);

MainRoute.propTypes = {
  user: userType,
  token: PropTypes.string,
  location: PropTypes.object,
};
MainRoute.defaultProps = {
  token: null,
  user: null,
};

export default MainRoute;
