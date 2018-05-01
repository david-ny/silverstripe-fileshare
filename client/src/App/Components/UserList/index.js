// import React from 'react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import User from '../User';
import {
  configPropType,
  configDefaultPropType,
  userListType,
} from '../../types';

class UserList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prevLocation: '',
    };

    this.showUsersList = this.showUsersList.bind(this);
  }

  componentWillMount() {
    const { location, history } = this.props;
    this.setState(() => {
      return { prevLocation: location.pathname };
    });
    history.listen(() => {
      this.showUsersList(location);
    });
  }

  componentDidMount() {
    const { resetActAsUser, fetchUserList, location } = this.props;
    const { prevLocation } = this.state;
    if (location.pathname !== prevLocation) {
      resetActAsUser();
    }
    fetchUserList(true);
  }

  showUsersList(location) {
    const { resetActAsUser } = this.props;
    const { prevLocation } = this.state;
    if (location.pathname === prevLocation) {
      resetActAsUser();
    }
  }

  render() {
    const {
      display,
      config,
      userList,
      setActAsUser,
    } = this.props;

    return (
      <div
        className="table-wrap"
        style={!display ? { display: 'none' } : { display: 'block' }}
      >
        <table className="main-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th><button type="button">Name</button></th>
              <th />
              <th />
              <th><button type="button">Email</button></th>
              <th><button type="button" /></th>
              <th><button type="button">...</button></th>
            </tr>
          </thead>
          <tbody>

            {userList.map(item => (

              <User
                key={item.userID}
                userID={item.userID}
                firstName={item.firstName}
                lastName={item.lastName}
                email={item.email}
                config={config}
                setActAsUser={setActAsUser}
              />

            ))}

          </tbody>
        </table>
      </div>
    );
  }
}

UserList.propTypes = {
  config: configPropType,
  display: PropTypes.bool.isRequired,
  userList: userListType.isRequired,
  fetchUserList: PropTypes.func.isRequired,
  setActAsUser: PropTypes.func.isRequired,
  resetActAsUser: PropTypes.func.isRequired,
};
UserList.defaultProps = {
  config: configDefaultPropType,
};

export default withRouter(UserList);
