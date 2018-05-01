import React from 'react';
import PropTypes from 'prop-types';

const RightPane = ({

  children,
  rightPanelActive,
}) => (
  <nav className={`right-side ${rightPanelActive && 'active'}`}>
    {children}
  </nav>
);

RightPane.propTypes = {

  children: PropTypes.node,
  rightPanelActive: PropTypes.bool.isRequired,
};
RightPane.defaultProps = {
  children: null,
};

export default RightPane;
