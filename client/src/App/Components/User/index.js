import React from 'react';
import PropTypes from 'prop-types';
// import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
  configPropType,
  configDefaultPropType,
} from '../../types';

const User = ({
  userID,
  firstName,
  lastName,
  email,
  config,
  setActAsUser,
}) => (
  <tr key={userID}>
    <td>
      <input type="checkbox" />
    </td>
    <td className="file">
      <button
        className="filename"
        alt={`${firstName} ${lastName}`}
        title={`${firstName} ${lastName}`}
        onClick={() => setActAsUser(userID, firstName, lastName, email)}
        type="button"
      >
        <img src={`${config.app.imagePath}/user.svg`} alt="folder" />
        {firstName} {lastName}
      </button>
    </td>
    <td />
    <td />
    <td>{email}</td>
    <td />
    <td>
      {/* <UncontrolledDropdown>
        <DropdownToggle caret className="file-menu-trigger">
          ...
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Delete</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown> */}
    </td>
  </tr>
);

User.propTypes = {
  config: configPropType,
  userID: PropTypes.number.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  email: PropTypes.string.isRequired,
  setActAsUser: PropTypes.func.isRequired,
};
User.defaultProps = {
  config: configDefaultPropType,
  firstName: '',
  lastName: '',
};

export default User;
