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
  userType,
  viewPortType,
} from '../../types';
import {
  PATH_APP,
  PATH_DOWNLOAD,
} from '../../Config/constants';

const File = ({
  fileID,
  fileName,
  modified,
  size,
  config,
  token,
  user,
  deleteFileClick,
  linkShareClick,
  shareClick,
  type,
  sharedByMe,
  sharedWithMe,
  linkSharedByMe,
  toggleFileSelect,
  selectedFiles,
  viewPort,
}) => (
  <tr key={fileID}>
    <td>
      <Button
        className="selectFile"
        onClick={event => toggleFileSelect(event, fileID)}
      >
        {selectedFiles.includes(fileID) &&
          <span className="ti-check" />
        }
      </Button>
    </td>
    <td className="file">
      <a
        href={`${PATH_APP}${PATH_DOWNLOAD}/${fileName}/${fileID}?shared=${sharedWithMe ? 'yes' : 'no'}&token=${token}`}
        alt={fileName}
        title={fileName}
      >
        {sharedByMe &&
          <img src={`${config.app.imagePath}/file_shared_by_me.svg`} alt="file" />
        }
        {sharedWithMe &&
          <img src={`${config.app.imagePath}/file_shared.svg`} alt="file" />
        }
        {!sharedByMe && !sharedWithMe &&
          <img src={`${config.app.imagePath}/${sharedWithMe ? 'file_shared' : 'file'}.svg`} alt="file" />
        }
        {/* <img src={`${config.app.imagePath}/${sharedWithMe
          ?'file_shared' : 'file'}.svg`} alt="file" /> */}
        {fileName}
      </a>
    </td>
    <td>
      {sharedWithMe &&
        <Button
          color="link"
          title="Shared with me"
          className={`linkshare ${sharedWithMe ? 'active' : ''}`}
          // onClick={() => shareClick(fileID, fileName)}
        >
          <span className="ti-cloud " />
        </Button>
      }
      {(!sharedWithMe && user.group === 'admin') &&
        <Button
          color="link"
          title={`${sharedByMe ? 'Shared by me' : 'Share'}`}
          className={`action-icon ${sharedByMe ? 'active' : ''}`}
          onClick={() => shareClick(fileID, fileName)}
        >
          <span className="ti-sharethis " />
        </Button>
      }
    </td>
    <td>
      {(!sharedWithMe && user.group === 'admin') &&
        <Button
          color="link"
          title="Shareable link"
          className={`action-icon ${(linkSharedByMe) ? 'active' : ''}`}
          onClick={() => linkShareClick(fileID, fileName)}
        >
          <span className="ti-link " />
        </Button>
      }
    </td>
    <td>{modified.date}<br />{modified.time}</td>
    <td>{size}</td>
    <td>
      {/* <button type="button">...</button> */}
      <UncontrolledDropdown direction={`${viewPort.isSmall ? 'left' : 'down'}`}>
        <DropdownToggle caret className="file-menu-trigger">
          ...
        </DropdownToggle>
        {!sharedWithMe && user.group === 'admin'
          ?
            <DropdownMenu>
              <DropdownItem onClick={() => deleteFileClick(fileID, fileName, type)}>
                Delete
              </DropdownItem>
              <DropdownItem onClick={() => shareClick(fileID, fileName)}>
                Sharing
              </DropdownItem>
              <DropdownItem onClick={() => linkShareClick(fileID, fileName)}>
                Shareable link
              </DropdownItem>
            </DropdownMenu>
          :
            <DropdownMenu>
              <DropdownItem onClick={() => deleteFileClick(fileID, fileName, type)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
        }

      </UncontrolledDropdown>

    </td>
  </tr>
);

File.propTypes = {
  config: configPropType,
  fileID: PropTypes.number.isRequired,
  fileName: PropTypes.string.isRequired,
  modified: PropTypes.shape({
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
  }).isRequired,
  size: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  sharedByMe: PropTypes.bool.isRequired,
  sharedWithMe: PropTypes.bool.isRequired,
  linkSharedByMe: PropTypes.bool.isRequired,
  user: userType.isRequired,
  viewPort: viewPortType.isRequired,
  deleteFileClick: PropTypes.func.isRequired,
  linkShareClick: PropTypes.func.isRequired,
  shareClick: PropTypes.func.isRequired,
  toggleFileSelect: PropTypes.func.isRequired,
  selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
  // linkSharedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
};
File.defaultProps = {
  config: configDefaultPropType,
};

export default File;
