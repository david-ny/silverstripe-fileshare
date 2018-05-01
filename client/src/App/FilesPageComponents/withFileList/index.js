import React from 'react';
import PropTypes from 'prop-types';
import FileShareAPI from '../../API';
import {
  configPropType,
  configDefaultPropType,
  actAsUserType,
  actAsUserDefault,
} from '../../types';

const withFileList = (WrappedComponent) => {
  class WithFileListEnhancer extends React.Component {
    static getDerivedStateFromProps(nextProps) {
      const { config } = nextProps;
      return nextProps.showUsers
        ? {
          currentPath: [],
          currentFolderID: config.files.rootFolderID,
        }
        : null;
    }

    constructor(props) {
      super(props);
      const { config } = props;
      this.state = {
        currentFolderID: config.files.rootFolderID,
        currentPath: [],
        fileList: [],
        selectedFiles: [],
        showPlaceHolder: false,
      };
      this.fetchFileList = this.fetchFileList.bind(this);
      this.setCurrentPath = this.setCurrentPath.bind(this);
      this.pathClick = this.pathClick.bind(this);
      this.pathClickRoot = this.pathClickRoot.bind(this);
      this.folderClick = this.folderClick.bind(this);
      this.setRootPath = this.setRootPath.bind(this);
      this.toggleFileSelect = this.toggleFileSelect.bind(this);
      this.selectNone = this.selectNone.bind(this);
    }

    setCurrentPath(path) {
      this.setState(() => {
        return {
          currentPath: path,
        };
      });
    }

    setRootPath() {
      const { config } = this.props;
      const setStateForRootPath = () => {
        return {
          currentPath: [],
          currentFolderID: config.files.rootFolderID,
        };
      };
      this.setState(() => setStateForRootPath());
    }

    setFileList(result) {
      const { files } = result;
      const compareFolderOrFile = (a, b) => {
        let comparison = 0;
        if (a.type === 'Folder' && b.type === 'File') {
          comparison = -1;
        } else if (a.type === 'File' && b.type === 'Folder') {
          comparison = 1;
        }
        return comparison;
      };
      const sortedFileList = files.sort(compareFolderOrFile);
      const setStateForFileList = () => {
        return {
          fileList: sortedFileList,
          showPlaceHolder: false,
        };
      };
      this.setState(() => setStateForFileList());
    }

    toggleFileSelect(event, fileID) {
      event.preventDefault();

      const setStateForSelectFile = (prevState) => {
        const { selectedFiles } = prevState;
        const newSelectedFiles = selectedFiles.includes(fileID)
          ? selectedFiles.filter(item => item !== fileID)
          : [...selectedFiles, fileID];
        return {
          selectedFiles: newSelectedFiles,
        };
      };
      this.setState(prevState => setStateForSelectFile(prevState));
    }

    selectNone() {
      this.setState(() => {
        return { selectedFiles: [] };
      });
    }

    pathClick(folderID = this.props.config.files.rootFolderID) {
      const { config } = this.props;
      const setStateForCurrentPath = (prevState) => {
        const path = prevState.currentPath;
        const isCurrentFolderID = (item) => {
          return item.ID === folderID;
        };
        const pos = path.findIndex(isCurrentFolderID);
        const newPath = path.slice(0, pos + 1);
        return {
          currentPath: newPath,
          currentFolderID: folderID,
        };
      };
      if (folderID === config.files.rootFolderID) {
        this.setRootPath();
      } else {
        this.setState(prevState => setStateForCurrentPath(prevState));
      }
      this.fetchFileList(true, folderID);
    }

    fetchFileList(shouldShowPlaceHolder = false, folderID = this.props.config.files.rootFolderID) {
      const { token, config } = this.props;

      const setStateForRootPath = () => {
        return {
          currentPath: [],
          selectedFiles: [],
        };
      };

      const setStateForNewPath = () => {
        return {
          selectedFiles: [],
        };
      };

      if (!folderID || folderID === config.files.rootFolderID) {
        this.setState(() => setStateForRootPath());
      } else {
        this.setState(() => setStateForNewPath());
      }

      if (shouldShowPlaceHolder) {
        this.setState(() => {
          return {
            showPlaceHolder: true,
          };
        });
      }

      FileShareAPI.fetchFileList(
        token,
        this.props.actAsUser || null,
        folderID,
      )
        .then(response => response.json())
        .then(result => this.setFileList(result))
        .catch(e => this.setState({ error: e }));
    }

    pathClickRoot() {
      const { config } = this.props;
      this.pathClick(config.files.rootFolderID);
    }

    folderClick(folderID, folderName) {
      const isSameFolder = (path) => {
        return path.length === 0 || path.slice(-1)[0].ID !== folderID;
      };
      const setStateForCurrentPath = (prevState) => {
        const path = prevState.currentPath;
        const newItem = {
          ID: folderID,
          name: folderName,
        };
        const newPath = isSameFolder(path)
          ? [...path, newItem]
          : [...path];
        return {
          currentPath: newPath,
          currentFolderID: folderID,
        };
      };
      this.setState(prevState => setStateForCurrentPath(prevState));
      this.fetchFileList(true, folderID);
    }

    render() {
      const {
        fileList,
        showPlaceHolder,
        currentFolderID,
        currentPath,
        selectedFiles,
      } = this.state;

      return (
        <WrappedComponent
          fetchFileList={this.fetchFileList}
          fileList={fileList}
          showPlaceHolder={showPlaceHolder}
          currentPath={currentPath}
          currentFolderID={currentFolderID}
          setCurrentPath={this.setCurrentPath}
          pathClick={this.pathClick}
          pathClickRoot={this.pathClickRoot}
          setRootPath={this.setRootPath}
          folderClick={this.folderClick}
          toggleFileSelect={this.toggleFileSelect}
          selectedFiles={selectedFiles}
          selectNone={this.selectNone}
          {...this.props}
        />
      );
    }
  }

  WithFileListEnhancer.propTypes = {
    config: configPropType,
    displayUsers: PropTypes.bool.isRequired,
    token: PropTypes.string.isRequired,
    actAsUser: actAsUserType,
  };
  WithFileListEnhancer.defaultProps = {
    config: configDefaultPropType,
    actAsUser: actAsUserDefault,
  };

  return WithFileListEnhancer;
};

export default withFileList;
