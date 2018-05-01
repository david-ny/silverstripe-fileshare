import React from 'react';
import PropTypes from 'prop-types'
import { Button } from 'reactstrap';

const ShareDialogUser = ({
  userData,
  removePeopleClick,
}) => (
  <div
    style={{
      display: 'inline-block',
      whiteSpace: 'nowrap',
      background: 'white',
      margin: '0.3em',
      padding: '0.1em 0.3em',
      border: '1px solid lightGray',
      borderRadius: '0.3em',
    }}

  >
    {userData.displayName}
    <Button
      className="button-secondary"
      onClick={event => removePeopleClick(event, userData)}
      style={{
        margin: '0 0.5em',
        width: '1em',
        height: '1em',
        padding: '0',
        position: 'relative',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: '0.5em',
          display: 'inline-block',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        className="ti-close"
      />
    </Button>
  </div>
);

ShareDialogUser.propTypes = {
  // userData: PropTypes.shape(...).isRequired,
  removePeopleClick: PropTypes.func.isRequired,
};
ShareDialogUser.defaultProps = {
  // config: configDefaultPropType,
};

export default ShareDialogUser;
