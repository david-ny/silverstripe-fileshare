import React from 'react';
import PropTypes from 'prop-types';
import NewFolderDialog from './NewFolderDialog';
import FileShareAPI from '../../API';
import {
  actAsUserType,
  actAsUserDefault,
} from '../../types';

const withNewFolder = (WrappedComponent) => {
  class WithNewFolderEnhancer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        newFolderDialogVisible: false,
      };
      this.showNewFolderDialog = this.showNewFolderDialog.bind(this);
      this.hideNewFolderDialog = this.hideNewFolderDialog.bind(this);
      this.cancelCreateFolder = this.cancelCreateFolder.bind(this);
      this.createFolder = this.createFolder.bind(this);
    }

    createFolder(name, parentfolderID = null) {
      const { token } = this.props;
      FileShareAPI.createFolder(
        token,
        this.props.actAsUser || null,
        name,
        parentfolderID,
      )
        .then(() => {
          this.hideNewFolderDialog();
          // const { currentFolderID } = this.state;
          const { currentFolderID, fetchFileList } = this.props;
          fetchFileList(false, currentFolderID);
        })
        .catch(e => this.setState({ error: e }));
    }

    showNewFolderDialog() {
      this.setState({ newFolderDialogVisible: true });
    }

    hideNewFolderDialog() {
      this.setState({ newFolderDialogVisible: false });
    }

    cancelCreateFolder() {
      this.hideNewFolderDialog();
    }

    render() {
      const {
        newFolderDialogVisible,
      } = this.state;
      const {
        currentFolderID,
      } = this.props;
      return (
        <div>
          <WrappedComponent
            showNewFolderDialog={this.showNewFolderDialog}
            {...this.props}
          />
          {newFolderDialogVisible
            &&
            <NewFolderDialog
              createFolder={this.createFolder}
              currentFolderID={currentFolderID}
              cancel={this.cancelCreateFolder}
              title="New folder"
            />
          }
        </div>
      );
    }
  }
  WithNewFolderEnhancer.propTypes = {
    actAsUser: actAsUserType,
    token: PropTypes.string.isRequired,
    currentFolderID: PropTypes.number.isRequired,
    fetchFileList: PropTypes.func.isRequired,
  };
  WithNewFolderEnhancer.defaultProps = {
    actAsUser: actAsUserDefault,
  };

  return WithNewFolderEnhancer;
};

export default withNewFolder;
