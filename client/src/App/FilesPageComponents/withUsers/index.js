import React from 'react';
import PropTypes from 'prop-types';
import FileShareAPI from '../../API';
import {
  // configPropType,
  // configDefaultPropType,
  actAsUserType,
  actAsUserDefault,
} from '../../types';

const withUsers = (WrappedComponent) => {
  class WithUsersEnhancer extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        userList: [],
        showUserListPlaceHolder: false,
      };

      this.setUserList = this.setUserList.bind(this);
      this.fetchUserList = this.fetchUserList.bind(this);
    }

    setUserList(result) {
      const { users } = result;
      const setStateForUserList = () => {
        return {
          userList: users,
          showUserListPlaceHolder: false,
        };
      };
      this.setState(() => setStateForUserList());
    }

    fetchUserList(shouldShowPlaceHolder = false) {
      const { token } = this.props;
      if (shouldShowPlaceHolder) {
        this.setState(() => {
          return {
            showUserListPlaceHolder: true,
          };
        });
      }
      FileShareAPI.fetchUserList(
        token,
        this.props.actAsUser || null,
      )
        .then(response => response.json())
        .then(result => this.setUserList(result))
        .catch(e => this.setState({ error: e }));
    }

    render() {
      const {
        userList,
        showUserListPlaceHolder,
        // fetchUserList,
      } = this.state;
      return (
        <WrappedComponent
          userList={userList}
          showUserListPlaceHolder={showUserListPlaceHolder}
          fetchUserList={this.fetchUserList}
          {...this.props}
        />
      );
    }
  }
  WithUsersEnhancer.propTypes = {
    token: PropTypes.string.isRequired,
    actAsUser: actAsUserType,
  };
  WithUsersEnhancer.defaultProps = {
    actAsUser: actAsUserDefault,
  };

  return WithUsersEnhancer;
};

export default withUsers;
