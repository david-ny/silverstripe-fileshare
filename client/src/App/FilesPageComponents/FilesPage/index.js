import React from 'react';
import PropTypes from 'prop-types';
import MainLayout from '../../Components/MainLayout';
import FilesPageMenu from '../FilesPageMenu';
import Breadcrumbs from '../../Components/Breadcrumbs';
import FileList from '../FileList';
import UserList from '../../Components/UserList';
import ListPlaceHolder from '../../Components/ListPlaceHolder';
import {
  configPropType,
  configDefaultPropType,
  userType,
  fileListType,
  currentPathType,
  actAsUserType,
  actAsUserDefault,
  viewPortType,
  userListType,
} from '../../types';

const FilesPage = ({
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
  userListVisible,
  setActAsUser,
  resetActAsUser,
  linkShareClick,
  shareClick,
  fetchUserList,
  userList,
  showUserListPlaceHolder,
  showNewFolderDialog,
  onDragEnter,
  onDragLeave,
  onDragOver,
  leftPanelActive,
  rightPanelActive,
  toggleLeftPanel,
  toggleRightPanel,
  toggleFileSelect,
  selectedFiles,
  deleteSelectedFilesClick,
}) =>
  (
    <MainLayout
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      // onMouseLeave={onMouseLeave}
      config={config}
      user={user}
      logout={logout}
      viewPort={viewPort}
      leftPanelActive={leftPanelActive}
      rightPanelActive={rightPanelActive}
      toggleLeftPanel={toggleLeftPanel}
      toggleRightPanel={toggleRightPanel}
      headerContent={
        <Breadcrumbs
          config={config}
          viewPort={viewPort}
          currentPath={currentPath}
          rootElement={actAsUser
            ? actAsUser.displayName
            : mainTitle
          }
          pathClick={pathClick}
          pathClickRoot={pathClickRoot}
        />
      }
      rightPaneContent={
        <FilesPageMenu
          config={config}
          user={user}
          showNewFolderDialog={showNewFolderDialog}
          selectedFiles={selectedFiles}
          deleteSelectedFilesClick={deleteSelectedFilesClick}
        />
      }
    >
      { (showPlaceHolder || showUserListPlaceHolder) &&
        <ListPlaceHolder
          type={userListVisible ? 'userList' : 'fileList'}
          config={config}
        />
      }
      { userListVisible &&
        <UserList
          display={!showPlaceHolder}
          config={config}
          userList={userList}
          token={token}
          user={user}
          setActAsUser={setActAsUser}
          fetchUserList={fetchUserList}
          resetActAsUser={resetActAsUser}
          viewPort={viewPort}
        />
      }
      { !userListVisible &&
        <FileList
          display={!showPlaceHolder}
          config={config}
          fileList={fileList}
          folderClick={folderClick}
          deleteFileClick={deleteFileClick}
          linkShareClick={linkShareClick}
          shareClick={shareClick}
          token={token}
          user={user}
          fetchFileList={fetchFileList}
          toggleFileSelect={toggleFileSelect}
          selectedFiles={selectedFiles}
          resetActAsUser={resetActAsUser}
          viewPort={viewPort}
        />
      }
    </MainLayout>
  );

FilesPage.propTypes = {
  config: configPropType,
  token: PropTypes.string.isRequired,
  user: userType.isRequired,
  resetActAsUser: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  viewPort: viewPortType.isRequired,
  mainTitle: PropTypes.string.isRequired,
  fileList: fileListType.isRequired,
  showPlaceHolder: PropTypes.bool.isRequired,
  showUserListPlaceHolder: PropTypes.bool.isRequired,
  currentPath: currentPathType.isRequired,
  pathClick: PropTypes.func.isRequired,
  pathClickRoot: PropTypes.func.isRequired,
  folderClick: PropTypes.func.isRequired,
  deleteFileClick: PropTypes.func.isRequired,
  fetchFileList: PropTypes.func.isRequired,
  actAsUser: actAsUserType,
  userListVisible: PropTypes.bool.isRequired,
  setActAsUser: PropTypes.func.isRequired,
  linkShareClick: PropTypes.func.isRequired,
  shareClick: PropTypes.func.isRequired,
  fetchUserList: PropTypes.func.isRequired,
  userList: userListType.isRequired,
  showNewFolderDialog: PropTypes.func.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  leftPanelActive: PropTypes.bool.isRequired,
  rightPanelActive: PropTypes.bool.isRequired,
  toggleLeftPanel: PropTypes.func.isRequired,
  toggleRightPanel: PropTypes.func.isRequired,
  toggleFileSelect: PropTypes.func.isRequired,
  selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
  deleteSelectedFilesClick: PropTypes.func.isRequired,
};
FilesPage.defaultProps = {
  config: configDefaultPropType,
  actAsUser: actAsUserDefault,
};

export default FilesPage;
