import React from 'react';
import PropTypes from 'prop-types';
import { configPropType, configDefaultPropType } from '../../types';

const FilesPageMenu = ({
  config,
  showNewFolderDialog,
  selectedFiles,
  deleteSelectedFilesClick,
}) => (
  <ul>
    <li><span className="upload" id="browseButton" href="#" >Upload files</span></li>
    <li>
      <button onClick={showNewFolderDialog} type="button">
        <img src={`${config.app.imagePath}/new_folder.svg`} alt="New folder" />
        New folder
      </button>
    </li>
    {selectedFiles && selectedFiles.length > 0 &&
      <li>
        <span className="info"><strong>{selectedFiles.length}</strong> files selected:</span>
        <button onClick={deleteSelectedFilesClick} type="button">
          <span className="ti-trash " />&nbsp;
          Delete
        </button>
      </li>
    }
  </ul>
);

FilesPageMenu.propTypes = {
  config: configPropType,
  selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
  showNewFolderDialog: PropTypes.func.isRequired,
  deleteSelectedFilesClick: PropTypes.func.isRequired,
};
FilesPageMenu.defaultProps = {
  config: configDefaultPropType,
};

export default FilesPageMenu;
