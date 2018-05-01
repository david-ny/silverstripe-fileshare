import React from 'react';
import PropTypes from 'prop-types';
import ShareDialog from './ShareDialog';
import FileShareAPI from '../../API';
import {
  actAsUserType,
  actAsUserDefault,
} from '../../types';

const withShare = (WrappedComponent) => {
  class WithShareEnhancer extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        fileToShare: null,
        knownUserList: [],
        showShareDialog: false,
      };

      this.fetchKnownUsers = this.fetchKnownUsers.bind(this);
      this.setKnownUserList = this.setKnownUserList.bind(this);
      this.shareClick = this.shareClick.bind(this);
      this.hideShareDialog = this.hideShareDialog.bind(this);
      this.shareFileWithUsers = this.shareFileWithUsers.bind(this);
      this.showShareDialog = this.showShareDialog.bind(this);
      this.cancelShare = this.cancelShare.bind(this);
    }

    showShareDialog() {
      this.setState({ showShareDialog: true });
    }
    hideShareDialog() {
      this.setState({ showShareDialog: false });
    }

    cancelShare() {
      this.hideShareDialog();
    }

    shareClick(fileID, fileName) {
      const setStateForFileToShare = (
        users,
        currentUserID,
      ) => {
        return {
          fileToShare: {
            fileID,
            fileName,
            users,
            currentUserID,
          },
        };
      };

      const { token } = this.props;
      FileShareAPI.fetchUsersOfSharedFile(
        token,
        this.props.actAsUser || null,
        fileID,
      )
        .then(response => response.json())
        .then((result) => {
          this.setState(() => setStateForFileToShare(
            result.users,
            result.currentUserID,
          ));
          this.showShareDialog();
        })
        .catch(e => this.setState({ error: e }));
    }

    shareFileWithUsers(fileID, users) {
      const { token, fetchFileList, currentFolderID } = this.props;
      FileShareAPI.shareFileWithUsers(
        token,
        this.props.actAsUser || null,
        fileID,
        users,
      )
        .then(response => response.json())
        .then(() => {
          this.hideShareDialog();
          fetchFileList(false, currentFolderID);
        })
        .catch(e => this.setState({ error: e }));
    }

    fetchKnownUsers() {
      // for testing purposes
      // TODO: use different API endpoint for live Version
      // allow only for admin, or use predefined user groups,
      // and/or by users relations
      const { token } = this.props;
      FileShareAPI.fetchKnownUsers(token)
        .then(response => response.json())
        .then(result => this.setKnownUserList(result))
        .catch(e => this.setState({ error: e }));
    }

    setKnownUserList(result) {
      const { users } = result;
      const setStateForKnownUserList = () => {
        return {
          knownUserList: users,
        };
      };
      this.setState(() => setStateForKnownUserList());
    }

    render() {
      const {
        fileToShare,
        showShareDialog,
        knownUserList,
      } = this.state;
      return (
        <div>
          <WrappedComponent
            shareClick={this.shareClick}
            {...this.props}
          />
          {showShareDialog
            &&
            <ShareDialog
              fileID={fileToShare.fileID}
              fileName={fileToShare.fileName}
              cancel={this.cancelShare}
              title="Share"
              shareFileWithUsers={this.shareFileWithUsers}
              fetchKnownUsers={this.fetchKnownUsers}
              knownUserList={knownUserList}
              sharedWithUsers={fileToShare.users}
              currentUserID={fileToShare.currentUserID}
            />
          }
        </div>
      );
    }
  }
  WithShareEnhancer.propTypes = {
    token: PropTypes.string.isRequired,
    fetchFileList: PropTypes.func.isRequired,
    currentFolderID: PropTypes.number.isRequired,
    actAsUser: actAsUserType,
  };
  WithShareEnhancer.defaultProps = {
    actAsUser: actAsUserDefault,
  };

  return WithShareEnhancer;
};

export default withShare;
