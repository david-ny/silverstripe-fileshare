import React from 'react';
import PropTypes from 'prop-types';
import {
  configPropType,
  configDefaultPropType,
} from '../../types';

const withActAsUser = (WrappedComponent) => {
  class WithActAsUserEnhancer extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        actAsUser: null,
      };

      this.setActAsUser = this.setActAsUser.bind(this);
      this.resetActAsUser = this.resetActAsUser.bind(this);
    }

    setActAsUser(userId, firstName, lastName, email) {
      const setStateForActAsUser = () => {
        const displayName = !firstName && !lastName
          ? email
          : `${firstName || ''} ${lastName || ''}`;
        return {
          actAsUser: {
            userId,
            firstName,
            lastName,
            email,
            displayName,
          },
        };
      };
      this.setState(() => setStateForActAsUser());
    }

    resetActAsUser() {
      const setStateForActAsUser = () => {
        return {
          actAsUser: null,
        };
      };
      this.setState(() => setStateForActAsUser());
    }

    render() {
      const { actAsUser } = this.state;
      return (
        <WrappedComponent
          actAsUser={actAsUser}
          setActAsUser={this.setActAsUser}
          resetActAsUser={this.resetActAsUser}
          {...this.props}
        />
      );
    }
  }

  WithActAsUserEnhancer.propTypes = {
    config: configPropType,
    displayUsers: PropTypes.bool.isRequired,

  };
  WithActAsUserEnhancer.defaultProps = {
    config: configDefaultPropType,
  };

  return WithActAsUserEnhancer;
};

export default withActAsUser;
