import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
// import { compose } from 'redux';
import { compose } from 'recompose';
import withDelete from '../withDelete';
import withFileList from '../withFileList';
import withActAsUser from '../../Components/withActAsUser';
import withLinkShare from '../withLinkShare';
import withShare from '../withShare';
import withUsers from '../withUsers';
import withNewFolder from '../withNewFolder';
import withUpload from '../withUpload';
import FilesPage from '../FilesPage';
import {
  configPropType,
  configDefaultPropType,
  fileListType,
  currentPathType,
  actAsUserType,
  actAsUserDefault,
  viewPortType,
  userListType,
} from '../../types';

class FilesPageContainer extends Component {
  static getDerivedStateFromProps(nextProps) {
    const { displayUsers, actAsUser } = nextProps;
    return displayUsers && !actAsUser
      ? { userListVisible: true }
      : { userListVisible: false };
  }

  constructor(props) {
    super(props);

    const { displayUsers } = this.props;
    this.state = {
      leftPanelActive: false,
      rightPanelActive: false,
      userListVisible: displayUsers,
      error: null,
    };

    this.toggleLeftPanel = this.toggleLeftPanel.bind(this);
    this.toggleRightPanel = this.toggleRightPanel.bind(this);
  }

  toggleLeftPanel() {
    this.setState((prevState) => {
      return { leftPanelActive: !prevState.leftPanelActive };
    });
  }

  toggleRightPanel() {
    this.setState((prevState) => {
      return { rightPanelActive: !prevState.rightPanelActive };
    });
  }


  render() {
    // TODO use Redux...
    const {
      token,
      user,
      logout,
      config,
      viewPort,
      mainTitle,
      fileList,
      showPlaceHolder,
      currentPath,
      pathClick,
      pathClickRoot,
      folderClick,
      deleteFileClick,
      fetchFileList,
      actAsUser,
      resetActAsUser,
      setActAsUser,
      linkShareClick,
      shareClick,
      fetchUserList,
      userList,
      showUserListPlaceHolder,
      showNewFolderDialog,
      onDragEnter,
      onDragLeave,
      onDragOver,
      toggleFileSelect,
      selectedFiles,
      deleteSelectedFilesClick,
    } = this.props;

    const filesPageProps = {
      token,
      user,
      logout,
      config,
      viewPort,
      mainTitle,
      fileList,
      showPlaceHolder,
      currentPath,
      pathClick,
      pathClickRoot,
      folderClick,
      deleteFileClick,
      fetchFileList,
      actAsUser,
      resetActAsUser,
      setActAsUser,
      linkShareClick,
      shareClick,
      fetchUserList,
      userList,
      showUserListPlaceHolder,
      showNewFolderDialog,
      onDragEnter,
      onDragLeave,
      onDragOver,
      toggleFileSelect,
      selectedFiles,
      deleteSelectedFilesClick,
    };

    const {
      leftPanelActive,
      rightPanelActive,
      userListVisible,
    } = this.state;

    return (
      <FilesPage
        leftPanelActive={leftPanelActive}
        rightPanelActive={rightPanelActive}
        toggleLeftPanel={this.toggleLeftPanel}
        toggleRightPanel={this.toggleRightPanel}
        userListVisible={userListVisible}
        {...filesPageProps}
      />
    );
  }
}

FilesPageContainer.propTypes = {
  token: PropTypes.string.isRequired,
  config: configPropType,
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
    group: PropTypes.string.isRequired,
  }).isRequired,
  logout: PropTypes.func.isRequired,
  viewPort: viewPortType.isRequired,
  mainTitle: PropTypes.string.isRequired,
  fileList: fileListType.isRequired,
  currentPath: currentPathType.isRequired,
  pathClick: PropTypes.func.isRequired,
  pathClickRoot: PropTypes.func.isRequired,
  folderClick: PropTypes.func.isRequired,
  deleteFileClick: PropTypes.func.isRequired,
  fetchFileList: PropTypes.func.isRequired,
  actAsUser: actAsUserType,
  showPlaceHolder: PropTypes.bool.isRequired,
  showUserListPlaceHolder: PropTypes.bool.isRequired,
  // userListVisible: PropTypes.bool.isRequired,
  setActAsUser: PropTypes.func.isRequired,
  displayUsers: PropTypes.bool.isRequired,
  linkShareClick: PropTypes.func.isRequired,
  shareClick: PropTypes.func.isRequired,
  fetchUserList: PropTypes.func.isRequired,
  userList: userListType.isRequired,
  showNewFolderDialog: PropTypes.func.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  toggleFileSelect: PropTypes.func.isRequired,
  selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
  deleteSelectedFilesClick: PropTypes.func.isRequired,
  resetActAsUser: PropTypes.func.isRequired,
};
FilesPageContainer.defaultProps = {
  config: configDefaultPropType,
  actAsUser: actAsUserDefault,
};

export default compose(
  withRouter,
  withActAsUser,
  withFileList,
  withUsers,
  withDelete,
  withLinkShare,
  withShare,
  withNewFolder,
  withUpload,
)(FilesPageContainer);
