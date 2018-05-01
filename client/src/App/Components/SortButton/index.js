import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const SortButton = ({
  sortBy,
  onSort,
  activeSortKey,
  reverse,
  title,
  children,
}) => (
  <Button
    color="link"
    onClick={() => onSort(sortBy)}
    title={title}
    className={
      `${activeSortKey === sortBy ? 'active' : ''} `
      + `${reverse ? 'reverse' : ''} `
    }
  >
    {children} {
        activeSortKey === sortBy
          ? (activeSortKey === sortBy && reverse
            ? <span className="ti-arrow-down sub" />
            : <span className="ti-arrow-up sub" />)
          : ''
        }
  </Button>
);

SortButton.propTypes = {
  title: PropTypes.string,
  sortBy: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  activeSortKey: PropTypes.string,
  reverse: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};
SortButton.defaultProps = {
  title: '',
  activeSortKey: '',
};

export default SortButton;
