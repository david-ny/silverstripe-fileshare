import React from 'react';
// import PropTypes from 'prop-types';
// import { configPropType, configDefaultPropType } from '../../types';
import FileShareAPI from '../../API';


const withLogin = (WrappedComponent) => {
  class WithLoginEnhancer extends React.Component {
    constructor(props) {
      super(props);
      const tokenFromSession = sessionStorage.getItem('token') || null;
      const emailFromSession = sessionStorage.getItem('email') || null;
      const groupFromSession = sessionStorage.getItem('group') || null;
      // const userIDFromSession = sessionStorage.getItem('userID') || null;
      const token = tokenFromSession;
      // const user = (emailFromSession && groupFromSession && userIDFromSession)
      const user = (emailFromSession && groupFromSession)
        ? {
          email: emailFromSession,
          group: groupFromSession,
          // id: userIDFromSession
        }
        : null;

      this.state = {
        // loggedIn: false,
        token,
        failedLogin: false,
        user,
      };

      this.login = this.login.bind(this);
      this.logout = this.logout.bind(this);
    }

    login(email, password) {
      FileShareAPI.login(email, password)
        .then(response => response.json())
        .then((result) => {
          this.handleLoginResponse(result, email);
        });
      // .catch(e => this.setState({ error: e }));
    }

    handleLoginResponse(response, email) {
      const setStateOnFailedLogin = () => {
        return {
          loggedIn: false,
          token: null,
          user: null,
          failedLogin: true,
        };
      };
      // const setStateOnSuccesfulLogin = (token, group, userID) => {
      const setStateOnSuccesfulLogin = (token, group) => {
        return {
          loggedIn: true,
          token,
          user: {
            email,
            group,
            // id: userID.
          },
          failedLogin: false,
        };
      };
      if (
        !response.result
        || !response.token
        || !response.group
        || response.group === 'none'
      ) {
        this.setState(() => setStateOnFailedLogin());
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('group');
        // sessionStorage.removeItem('userID');
      } else {
        this.setState(() => setStateOnSuccesfulLogin(
          response.token,
          response.group,
          // response.userID,
        ));
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('group', response.group);
        // sessionStorage.setItem('userID', response.userID);
        // this.state.resumable.opts.headers['X-Silverstripe-Apitoken'] = response.token;
      }
    }

    logout() {
      const { token, user } = this.state;
      FileShareAPI.logout(token, user.email);
      // .then(response => response.json())
      // .then((result) => {
      //   // console.log(result);
      // };
      const setStateOnLogout = () => {
        return {
          loggedIn: false,
          token: null,
          // userID: null,
          user: null,
        };
      };
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('group');
      this.setState(() => setStateOnLogout());
    }

    render() {
      const { token, user, failedLogin } = this.state;
      return (
        <WrappedComponent
          token={token}
          user={user}
          failedLogin={failedLogin}
          login={this.login}
          logout={this.logout}
          {...this.props}
        />
      );
    }
  }

  // WithLoginEnhancer.propTypes = {
  //   // config: configPropType,
  //   // displayUsers: PropTypes.bool.isRequired,
  //
  // };
  // WithLoginEnhancer.defaultProps = {
  //   // config: configDefaultPropType,
  // };

  return WithLoginEnhancer;
};

export default withLogin;
