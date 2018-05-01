import React from 'react';
import PropTypes from 'prop-types';
import LinkShareDialog from './LinkShareDialog';
import FileShareAPI from '../../API';
import {
  actAsUserType,
  actAsUserDefault,
  fileListType,
} from '../../types';

import {
  PATH_APP,
  PATH_LINKSHARE,
} from '../../Config/constants';

const withLinkShare = (WrappedComponent) => {
  class WithLinkShareEnhancer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        fileToLinkShare: null,
        showLinkShareDialog: false,
      };
      this.linkShareClick = this.linkShareClick.bind(this);
      this.showLinkShareDialog = this.showLinkShareDialog.bind(this);
      this.hideLinkShareDialog = this.hideLinkShareDialog.bind(this);
      this.linkShareEnableClick = this.linkShareEnableClick.bind(this);
      this.linkShareEnableAndCloseClick = this.linkShareEnableAndCloseClick.bind(this);
      this.cancelLinkShare = this.cancelLinkShare.bind(this);
      this.linkShareDeleteClick = this.linkShareDeleteClick.bind(this);
    }

    cancelLinkShare() {
      this.hideLinkShareDialog();
    }

    linkShareEnableClick(fileID, linkID, fileName) {
      const setStateForLinkShareEnableClick = () => {
        const link = `${PATH_APP}${PATH_LINKSHARE}/${linkID}/${fileName}`;
        return {
          fileToLinkShare: {
            fileID,
            fileName,
            linkID,
            linkActive: true,
            link,
          },
        };
      };
      const { token, fetchFileList, currentFolderID } = this.props;
      FileShareAPI.enableLinkShare(
        token,
        this.props.actAsUser || null,
        fileID,
        linkID,
      )
        .then(response => response.json())
        .then(() => {
          this.setState(prevState => setStateForLinkShareEnableClick(prevState));
          fetchFileList(false, currentFolderID);
        })
        .catch(e => this.setState({ error: e }));
    }

    linkShareEnableAndCloseClick(fileID, linkID) {
      this.linkShareEnableClick(fileID, linkID);
      this.hideLinkShareDialog();
    }

    linkShareDeleteClick(fileID, linkID) {
      this.hideLinkShareDialog();
      const setStateForLinkShareDeleteClick = () => {
        return {
          fileToLinkShare: null,
        };
      };
      const { token } = this.props;

      FileShareAPI.deleteLinkShare(
        token,
        this.props.actAsUser || null,
        fileID,
        linkID,
      )
        .then(response => response.json())
        .then(() => {
          this.setState(prevState => setStateForLinkShareDeleteClick(prevState));
          this.props.fetchFileList(false, this.props.currentFolderID);
          // console.log('linkShareDeleteClick-> this.state');
          // console.log(this.state);
        })
        .catch(e => this.setState({ error: e }));
    }

    showLinkShareDialog() {
      this.setState({ showLinkShareDialog: true });
    }
    hideLinkShareDialog() {
      this.setState({ showLinkShareDialog: false });
    }

    linkShareClick(fileID, fileName) {
      const setStateForFileToLinkShare = (linkID, linkActive) => {
        const link = `${PATH_APP}${PATH_LINKSHARE}/${linkID}/${fileName}`;
        return {
          fileToLinkShare: {
            fileID,
            fileName,
            linkID,
            linkActive,
            link,
          },
        };
      };

      const { token } = this.props;
      FileShareAPI.createLinkShare(
        token,
        this.props.actAsUser || null,
        fileID,
      )
        .then(response => response.json())
        .then((result) => {
          this.setState(() => setStateForFileToLinkShare(
            result.linkShare.LinkID,
            result.linkShare.Active,
          ));
          // console.log('linkShareClick-> this.state');
          // console.log(this.state);
          this.showLinkShareDialog();
        })
        .catch(e => this.setState({ error: e }));
      // this.showLinkShareDialog();
    }

    render() {
      const {
        // linkSharedFiles,
        fileToLinkShare,
        showLinkShareDialog,
      } = this.state;
      return (
        <div>
          <WrappedComponent
            linkShareClick={this.linkShareClick}
            linkShareEnableClick={this.linkShareEnableClick}
            linkShareDeleteClick={this.linkShareDeleteClick}
            {...this.props}
          />
          {showLinkShareDialog
            &&
            <LinkShareDialog
              link={fileToLinkShare.link}
              linkID={fileToLinkShare.linkID}
              fileID={fileToLinkShare.fileID}
              fileName={fileToLinkShare.fileName}
              linkActive={fileToLinkShare.linkActive}
              cancel={this.cancelLinkShare}
              title="Shareable link"
              enableSharedLink={this.linkShareEnableClick}
              enableSharedLinkAndClose={this.linkShareEnableAndCloseClick}
              deleteSharedLinkAndClose={this.linkShareDeleteClick}
            />
          }
        </div>
      );
    }
  }
  WithLinkShareEnhancer.propTypes = {
    token: PropTypes.string.isRequired,
    actAsUser: actAsUserType,
    fileList: fileListType.isRequired,
    fetchFileList: PropTypes.func.isRequired,
    currentFolderID: PropTypes.number.isRequired,
  };
  WithLinkShareEnhancer.defaultProps = {
    actAsUser: actAsUserDefault,
  };

  return WithLinkShareEnhancer;
};

export default withLinkShare;
