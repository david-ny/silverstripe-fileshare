// import React from 'react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { sortBy } from 'lodash';
import { Button } from 'reactstrap';
import Folder from '../Folder';
import File from '../File';
import SortButton from '../../Components/SortButton';
import {
  configPropType,
  configDefaultPropType,
  userType,
  viewPortType,
  fileListType,
} from '../../types';

class FileList extends Component {
  static sortFilesAlphabetically(fileList) {
    const compareFolderOrFile = (a, b) => {
      let comparison = 0;
      if (a.fileName.toUpperCase() < b.fileName.toUpperCase()) {
        comparison = -1;
      } else {
        comparison = 1;
      }
      return comparison;
    };
    const sortedFileList = fileList.sort(compareFolderOrFile);
    return sortedFileList;
  }
  // static sortFoldersFirts(fileList) {
  //   const compareFolderOrFile = (a, b) => {
  //     let comparison = 0;
  //     if (a.type === 'Folder' && b.type === 'File') {
  //       comparison = -1;
  //     } else if (a.type === 'File' && b.type === 'Folder') {
  //       comparison = 1;
  //     }
  //     return comparison;
  //   };
  //   return fileList.sort(compareFolderOrFile);
  // }

  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'MODIFIED',
      sortedReverse: true,
      prevLocation: '',
    };
    this.onSort = this.onSort.bind(this);
  }

  componentWillMount() {
    const { location } = this.props;
    // const { prevLocation } = this.state;
    this.setState(() => {
      return { prevLocation: location.pathname };
    });
  }
  componentDidMount() {
    const { resetActAsUser, fetchFileList, location } = this.props;
    const { prevLocation } = this.state;
    // console.log(prevLocation);
    // console.log(location.pathname);
    if (location.pathname !== prevLocation) {
      resetActAsUser();
    }
    fetchFileList(true);
  }

  // onSort(sortKey) {
  //   this.setState({ sortKey });
  // }
  onSort(sortKey) {
    const sortedReverse = this.state.sortKey === sortKey
      && !this.state.sortedReverse;
    this.setState({ sortKey, sortedReverse });
  }


  render() {
    const {
      display,
      config,
      fileList,
      folderClick,
      token,
      user,
      deleteFileClick,
      linkShareClick,
      // linkSharedFiles,
      shareClick,
      toggleFileSelect,
      selectedFiles,
      viewPort,
    } = this.props;

    const { sortKey, sortedReverse } = this.state;

    const sortedFileList = SORTS[sortKey](fileList);
    const reverseSortedList = sortedReverse
      ? sortedFileList.reverse()
      : sortedFileList;
    // const foldersFirstList = FileList.sortFoldersFirts(reverseSortedList);
    const foldersFirstList = sortBy(reverseSortedList, 'type').reverse();

    return (
    // <div className="main">
      <div
        className="table-wrap"
        style={!display ? { display: 'none' } : { display: 'block' }}
      >
        <table className="main-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>
                <SortButton
                  sortBy="NAME"
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                  reverse={sortedReverse}
                >
                  <span>Name</span>
                </SortButton>
              </th>
              <th>
                <SortButton
                  sortBy="SHARE"
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                  reverse={sortedReverse}
                  title="Sharing"
                >
                  <span className="ti-sharethis " />
                </SortButton>
              </th>
              <th>
                <SortButton
                  sortBy="LINKSHARE"
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                  reverse={sortedReverse}
                  title="Sharing"
                >
                  <span className="ti-link " />
                </SortButton>
              </th>
              <th>
                <SortButton
                  sortBy="MODIFIED"
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                  reverse={sortedReverse}
                >
                  <span>Modified</span>
                </SortButton>
              </th>
              <th>
                <SortButton
                  sortBy="SIZE"
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                  reverse={sortedReverse}
                >
                  <span>Size</span>
                </SortButton>
              </th>
              <th>
                <Button color="link">
                  <span>...</span>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>

            {foldersFirstList.map(item => (
              (item.type === 'Folder')
                ?
                  <Folder
                    key={item.key}
                    folderID={item.key}
                    fileName={item.fileName}
                    modified={item.modified}
                    config={config}
                    user={user}
                    folderClick={folderClick}
                    deleteFileClick={deleteFileClick}
                    type={item.type}
                    toggleFileSelect={toggleFileSelect}
                    selectedFiles={selectedFiles}
                    viewPort={viewPort}
                  />
                :
                  <File
                    key={item.key}
                    fileID={item.key}
                    fileName={item.fileName}
                    modified={item.modified}
                    size={item.size}
                    config={config}
                    token={token}
                    user={user}
                    deleteFileClick={deleteFileClick}
                    linkShareClick={linkShareClick}
                    // linkSharedFiles={linkSharedFiles}
                    shareClick={shareClick}
                    type={item.type}
                    sharedByMe={item.sharedByMe}
                    sharedWithMe={item.sharedWithMe}
                    linkSharedByMe={item.linkSharedByMe}
                    toggleFileSelect={toggleFileSelect}
                    selectedFiles={selectedFiles}
                    viewPort={viewPort}
                  />
            ))}

          </tbody>
        </table>
      </div>
      // </div>
    );
  }
}

FileList.propTypes = {
  config: configPropType,
  display: PropTypes.bool.isRequired,
  token: PropTypes.string.isRequired,
  fileList: fileListType.isRequired,
  user: userType.isRequired,
  viewPort: viewPortType.isRequired,
  resetActAsUser: PropTypes.func.isRequired,
  fetchFileList: PropTypes.func.isRequired,
  folderClick: PropTypes.func.isRequired,
  deleteFileClick: PropTypes.func.isRequired,
  linkShareClick: PropTypes.func.isRequired,
  shareClick: PropTypes.func.isRequired,
  toggleFileSelect: PropTypes.func.isRequired,
  selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
};
FileList.defaultProps = {
  config: configDefaultPropType,
};

const SORTS = {
  NONE: list => list,
  // NAME: list => sortBy(list, 'fileName'),
  NAME: list => FileList.sortFilesAlphabetically(list),
  SHARE: list => sortBy(
    list,
    ['sharedByMe', 'sharedWithMe', 'modified.time', 'modified.date'],
  ).reverse(),
  LINKSHARE: list => sortBy(
    list,
    ['linkSharedByMe', 'modified.time', 'modified.date'],
  ).reverse(),
  MODIFIED: list => sortBy(
    list,
    ['modified.date', 'modified.time'],
  ).reverse(),
  SIZE: list => sortBy(list, 'byteSize').reverse(),
};

export default withRouter(FileList);
