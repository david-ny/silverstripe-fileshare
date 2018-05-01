import React from 'react';
import PropTypes from 'prop-types';
import DeleteFileConfirmationDialog from './DeleteFileConfirmationDialog';
import DeleteSelectedFilesConfirmationDialog from './DeleteSelectedFilesConfirmationDialog';
import FileShareAPI from '../../API';
import {
  configPropType,
  configDefaultPropType,
  fileListType,
  actAsUserType,
  actAsUserDefault,
} from '../../types';

const withDelete = (WrappedComponent) => {
  class WithDeleteEnhancer extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        fileToDelete: null,
        selectedFilesToDelete: null,
        showDeleteFileDialog: false,
      };

      this.deleteFileClick = this.deleteFileClick.bind(this);
      this.deleteSelectedFilesClick = this.deleteSelectedFilesClick.bind(this);
      this.deleteFile = this.deleteFile.bind(this);
      this.deleteFiles = this.deleteFiles.bind(this);
      this.cancelDeleteFile = this.cancelDeleteFile.bind(this);
      this.showDeleteFileDialog = this.showDeleteFileDialog.bind(this);
      this.hideDeleteFileDialog = this.hideDeleteFileDialog.bind(this);
      this.showDeleteSelectedFilesDialog = this.showDeleteSelectedFilesDialog.bind(this);
      this.hideDeleteSelectedFilesDialog = this.hideDeleteSelectedFilesDialog.bind(this);
      this.cancelDeleteSelectedFiles = this.cancelDeleteSelectedFiles.bind(this);
    }

    showDeleteSelectedFilesDialog() {
      this.setState({ showDeleteSelectedFilesDialog: true });
    }

    hideDeleteSelectedFilesDialog() {
      this.setState({ showDeleteSelectedFilesDialog: false });
    }

    cancelDeleteSelectedFiles() {
      this.hideDeleteSelectedFilesDialog();
    }

    showDeleteFileDialog() {
      this.setState({ showDeleteFileDialog: true });
    }

    hideDeleteFileDialog() {
      this.setState({ showDeleteFileDialog: false });
    }

    cancelDeleteFile() {
      this.hideDeleteFileDialog();
    }

    deleteFileClick(fileID, fileName, type) {
      const { selectedFiles, selectNone } = this.props;
      if (
        selectedFiles.length === 1
        && selectedFiles[0] === fileID
      ) {
        selectNone();
      }

      let folderNotEmpty = false;
      let dialogTitle = 'Delete file?';
      if (type === 'Folder') {
        dialogTitle = 'Delete folder?';
        // TODO:
        // const folderNotEmpty = !this.isFolderEmpty(fileID);
        folderNotEmpty = false;
      }
      const setStateForFileToDelete = () => {
        return {
          fileToDelete: {
            fileID,
            fileName,
            type,
            folderNotEmpty,
            dialogTitle,
          },
        };
      };
      this.setState(() => setStateForFileToDelete());
      this.showDeleteFileDialog();
    }

    deleteSelectedFilesClick() {
      // console.log('deleteFileClick');
      const { selectedFiles, fileList } = this.props;
      if (selectedFiles.length === 1) {
        const fileID = selectedFiles[0];
        const files = fileList.filter((item) => {
          return item.key === fileID;
        });
        this.deleteFileClick(fileID, files[0].fileName, files[0].type);
        return;
      }
      const dialogTitle = 'Delete selected items?';
      const setStateForSelectedFilesToDelete = () => {
        return {
          selectedFilesToDelete: {
            dialogTitle,
          },
        };
      };
      this.setState(() => setStateForSelectedFilesToDelete());
      this.showDeleteSelectedFilesDialog();
    }

    deleteFile(fileID) {
      const { token, fetchFileList, currentFolderID } = this.props;
      FileShareAPI.deleteFile(
        token,
        this.props.actAsUser || null,
        fileID,
      )
        .then(() => {
          this.hideDeleteFileDialog();
          fetchFileList(false, currentFolderID);
        })
        .catch(e => this.setState({ error: e }));
      // TODO: undo
    }

    deleteFiles(fileIDs) {
      const {
        token,
        fetchFileList,
        currentFolderID,
        selectNone,
      } = this.props;
      FileShareAPI.deleteFiles(
        token,
        this.props.actAsUser || null,
        fileIDs,
      )
        .then(() => {
          selectNone();
          this.hideDeleteSelectedFilesDialog();
          fetchFileList(false, currentFolderID);
        })
        .catch(e => this.setState({ error: e }));
      // TODO: undo
    }

    render() {
      const {
        fileToDelete,
        selectedFilesToDelete,
      } = this.state;
      return (
        <div>
          <WrappedComponent
            deleteFileClick={this.deleteFileClick}
            deleteSelectedFilesClick={this.deleteSelectedFilesClick}
            {...this.props}
          />
          {this.state.showDeleteFileDialog
            &&
            <DeleteFileConfirmationDialog
              fileID={fileToDelete.fileID}
              fileName={fileToDelete.fileName}
              cancel={this.cancelDeleteFile}
              title={fileToDelete.dialogTitle}
              deleteFile={this.deleteFile}
              type={fileToDelete.type}
              folderNotEmpty={fileToDelete.folderNotEmpty}
            />
          }
          {this.state.showDeleteSelectedFilesDialog
            &&
            <DeleteSelectedFilesConfirmationDialog
              cancel={this.cancelDeleteSelectedFiles}
              title={selectedFilesToDelete.dialogTitle}
              deleteFile={this.deleteFile}
              deleteFiles={this.deleteFiles}
              selectedFiles={this.props.selectedFiles}
            />
          }
        </div>
      );
    }
  }

  WithDeleteEnhancer.propTypes = {
    config: configPropType,
    displayUsers: PropTypes.bool.isRequired,
    selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
    fileList: fileListType.isRequired,
    token: PropTypes.string.isRequired,
    fetchFileList: PropTypes.func.isRequired,
    currentFolderID: PropTypes.number.isRequired,
    selectNone: PropTypes.func.isRequired,
    // actAsUser: PropTypes.bool.isRequired,
    actAsUser: actAsUserType,
  };
  WithDeleteEnhancer.defaultProps = {
    config: configDefaultPropType,
    actAsUser: actAsUserDefault,
  };

  return WithDeleteEnhancer;
};

export default withDelete;
