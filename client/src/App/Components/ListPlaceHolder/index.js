import React from 'react';
import PropTypes from 'prop-types';
import {
  configPropType,
  configDefaultPropType,
} from '../../types';

const ListPlaceHolder = ({
  type,
  config,
}) => {
  const lines = [];
  for (let i = 0; i < 200; i += 1) {
    lines.push(
      <tr key={i} >
        <td />
        <td className="file">
          <img
            src={`${config.app.imagePath}/${type === 'userList' ? 'user' : 'file'}-placeholder.svg`}
            alt="file"
          />
          <span className="placeHolderText">XXXXXXXXXX</span>
        </td>
        <td />
        <td />
        <td><span className="placeHolderText">XXXXX</span></td>
        <td><span className="placeHolderText">XXX</span></td>
        <td />
      </tr>,
    );
  }
  return (
    <div className="table-wrap">
      <table className="main-table">
        <thead>
          <tr>
            <th /><th /><th /><th /><th /><th /><th />
          </tr>
        </thead>
        <tbody>
          {lines.map(item => (
            item
          ))}
        </tbody>
      </table>
    </div>
  );
};

ListPlaceHolder.propTypes = {
  config: configPropType,
  type: PropTypes.string.isRequired,

};
ListPlaceHolder.defaultProps = {
  config: configDefaultPropType,
};

export default ListPlaceHolder;
