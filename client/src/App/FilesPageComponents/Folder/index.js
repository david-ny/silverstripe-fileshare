import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import {
  configPropType,
  configDefaultPropType,
  modifiedType,
  viewPortType,
} from '../../types';

const Folder = ({
  folderID,
  fileName,
  modified,
  type,
  config,
  folderClick,
  deleteFileClick,
  toggleFileSelect,
  selectedFiles,
  viewPort,
}) => (
  <tr key={folderID}>
    <td>
      <Button
        className="selectFile"
        onClick={event => toggleFileSelect(event, folderID)}
      >
        {selectedFiles.includes(folderID) &&
          <span className="ti-check" />
        }
      </Button>
    </td>
    <td className="file">
      <button
        className="filename"
        alt={fileName}
        title={fileName}
        onClick={() => folderClick(folderID, fileName)}
        type="button"
      >
        <img src={`${config.app.imagePath}/folder.svg`} alt="folder" />
        {fileName}
      </button>
    </td>
    <td />
    <td />
    <td>{modified.date}<br />{modified.time}</td>
    <td>[DIR]</td>
    <td>
      <UncontrolledDropdown direction={`${viewPort.isSmall ? 'left' : 'down'}`}>
        <DropdownToggle caret className="file-menu-trigger">
          ...
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem
            onClick={() => deleteFileClick(folderID, fileName, type)}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </td>
  </tr>
);

Folder.propTypes = {
  folderID: PropTypes.number.isRequired,
  fileName: PropTypes.string.isRequired,
  modified: modifiedType.isRequired,
  type: PropTypes.string.isRequired,
  viewPort: viewPortType.isRequired,
  config: configPropType,
  folderClick: PropTypes.func.isRequired,
  deleteFileClick: PropTypes.func.isRequired,
  toggleFileSelect: PropTypes.func.isRequired,
  selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
};
Folder.defaultProps = {
  config: configDefaultPropType,
};

export default Folder;
