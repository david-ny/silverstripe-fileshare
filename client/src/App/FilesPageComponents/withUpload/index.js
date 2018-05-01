import React from 'react';
import PropTypes from 'prop-types';
import MessageScreen from './MessageScreen';
import DroptargetOverlay from './DroptargetOverlay';
import FileShareAPI from '../../API';
import {
  configPropType,
  configDefaultPropType,
  actAsUserType,
  actAsUserDefault,
} from '../../types';

const withUpload = (WrappedComponent) => {
  class WithUploadEnhancer extends React.Component {
    static DROP_AREA = document.getElementById('app');

    static isFileDragged (event) {
      const dt = event.dataTransfer;
      return (
        dt.types
        && (dt.types.indexOf
          ? dt.types.indexOf('Files') !== -1
          : dt.types.contains('Files'))
      );
    }

    static isCusrsorOverDropArea = (event, margin) => {
      const el = WithUploadEnhancer.DROP_AREA;
      const test = (event.clientX >= el.clientLeft + (el.clientLeft * margin)
        && event.clientX <= el.clientWidth - (el.clientWidth * margin)
        && event.clientY >= el.clientTop + (el.clientTop * margin)
        && event.clientY <= el.clientHeight - (el.clientHeight * margin));
      return test;
    }

    constructor(props) {
      super(props);

      const { config } = this.props;

      this.state = {
        rootFolderID: config.files.rootFolderID,
        showDropAreaHighlight: false,
        allProgress: 0,
        filesUploading: [],
        filesUploadedWaintingForServer: [],
        displayMessageScreen: false,
        messageScreenHideable: false,
        messageScreenTitle: '',
      };

      this.pollUploadedFileProcessedState = this.pollUploadedFileProcessedState.bind(this);
      this.setUploadfinished = this.setUploadfinished.bind(this);
      this.onDragEnter = this.onDragEnter.bind(this);
      this.onDragLeave = this.onDragLeave.bind(this);
      this.onDragOver = this.onDragOver.bind(this);
      // this.onMouseLeave = this.onMouseLeave.bind(this);
      this.stopDrag = this.stopDrag.bind(this);
      this.onDrop = this.onDrop.bind(this);
      this.onResumableFileAdded = this.onResumableFileAdded.bind(this);
      this.onResumableFileSuccess = this.onResumableFileSuccess.bind(this);
      this.onResumableFileError = this.onResumableFileError.bind(this);
      this.onResumableFileRetry = this.onResumableFileRetry.bind(this);
      this.onResumableUploadStart = this.onResumableUploadStart.bind(this);
      this.onResumableComplete = this.onResumableComplete.bind(this);
      this.onResumableProgress = this.onResumableProgress.bind(this);
      this.upload = this.upload.bind(this);
      this.cancel = this.cancel.bind(this);
      this.pause = this.pause.bind(this);
      // this.info = this.info.bind(this);
      this.refresh = this.refresh.bind(this);
      this.hideMessageScreen = this.hideMessageScreen.bind(this);
      this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
      const { resumable } = this.props;
      resumable.events = [];
      resumable.on('fileAdded', this.onResumableFileAdded);
      resumable.on('fileSuccess', this.onResumableFileSuccess);
      resumable.on('fileError', this.onResumableFileError);
      resumable.on('fileRetry', this.onResumableFileRetry);
      resumable.on('uploadStart', this.onResumableUploadStart);
      resumable.on('complete', this.onResumableComplete);
      resumable.on('progress', this.onResumableProgress);
      resumable.assignDrop(document.getElementById('app'));
      resumable.assignBrowse(document.getElementById('browseButton', true));
      document.addEventListener('keypress', this.handleKeyPress, false);
    }

    componentWillUnmount() {
      document.removeEventListener('keypress', this.handleKeyPress, false);
    }

    onResumableFileAdded(file) {
      file.resumableObj.opts.query = {
        parentFolderID: this.props.currentFolderID,
      };
      if (this.props.actAsUser) {
        file.resumableObj.opts.headers = Object.assign(
          file.resumableObj.opts.headers,
          { 'X-FileShare-ActAsUser': this.props.actAsUser.userId },
        );
      }
      this.setState((prevState) => {
        const newFile = `${this.props.currentFolderID}-${file.file.uniqueIdentifier}`;
        const filesUploading = prevState.filesUploading.concat([newFile]);
        return {
          filesUploading,
        };
      });
      this.onDrop();
    }

    onResumableFileSuccess(file, message) {
      const setStateOnResumableFileSuccess = (prevState) => {
        const items = prevState.filesUploadedWaintingForServer;
        const newItem = {
          resumableIdentifier: file.uniqueIdentifier,
          parentFolderID: file.resumableObj.opts.query.parentFolderID,
        };
        return {
          filesUploadedWaintingForServer: [...items, newItem],
          processingUploads: true,
        };
      };
      this.setState(prevState => setStateOnResumableFileSuccess(prevState));

      this.pollUploadedFileProcessedState(
        file.uniqueIdentifier,
        file.resumableObj.opts.query.parentFolderID,
      );
    }

    onResumableFileError(file, message) {
      console.log('fileError:');
      console.log(file);
      console.log(message);
    }

    onResumableFileRetry(file) {
      console.log('FileRetry:');
      console.log(file);
    }

    onResumableUploadStart() {
      const { files } = this.props.resumable;
      const reduceUnuploaded = (total, item) => {
        return item._prevProgress < 1 ? total + 1 : total;
      };
      const unuploadedCount = files.reduce(reduceUnuploaded, 0);
      this.setState({
        displayMessageScreen: true,
        messageScreenTitle: `Uploading ${unuploadedCount} file(s)`,
      });
    }

    onResumableComplete() {
      this.setState({
        messageScreenHideable: true,
      });
    }

    onResumableProgress() {
      this.setState({ allProgress: this.props.resumable.progress() });
    }

    onDragEnter (event) {
      // event.stopPropagation();
      event.preventDefault();
      const filesDragged = WithUploadEnhancer.isFileDragged(event);
      const setStateOnDragEnter = () => {
        return ({
          showDropAreaHighlight: true,
        });
      };
      if (filesDragged) {
        this.setState(() => setStateOnDragEnter());
      }
    }

    onDragOver (event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      return false;
    }

    onDragLeave (event) {
      if (!WithUploadEnhancer.isCusrsorOverDropArea(event, 0.08)) {
        this.setState(() => {
          return {
            showDropAreaHighlight: false,
          };
        });
      }
    }

    onDrop () {
      const setStateOnDrop = () => {
        return {
          // dragEnterLeaveCounter: 0,
          showDropAreaHighlight: false,
          displayMessageScreen: true,
          // messageScreenTitle: `Added ${this.resumable.files.length} file(s)`,
          messageScreenTitle: `Added ${this.props.resumable.files.length} file(s)`,
        };
      };

      this.setState(() => setStateOnDrop());
      this.upload();
    }

    setUploadfinished(resumableIdentifier, parentFolderID) {
      const setStateOnUploadfinished = (prevState) => {
        const items = prevState.filesUploadedWaintingForServer;
        const newItems = items.filter((item) => {
          return true
            && `${item.ResumableIdentifier}` === `${resumableIdentifier}`
            && (
              `${item.parentFolderID}` === `${parentFolderID}`
              || `${item.parentFolderID}` === `${this.state.rootFolderID}` // TODO this line probably not needed
            );
        });
        const processingUploads = newItems.length !== 0;
        return {
          filesUploadedWaintingForServer: newItems,
          processingUploads,
        };
      };
      this.setState(prevState => setStateOnUploadfinished(prevState));

      const { currentFolderID, fetchFileList } = this.props;
      fetchFileList(false, currentFolderID);

      const { token, resumable } = this.props;
      FileShareAPI.setUploadFinished(
        token,
        this.props.actAsUser || null,
        parentFolderID,
        resumableIdentifier,
      )
        .then(() => {
          const filesInResumable = resumable.files.filter((item) => {
            return true
            && item.file.uniqueIdentifier !== resumableIdentifier;
          });
          resumable.files = filesInResumable;
          this.setState((prevState) => {
            const filesUploading = prevState.filesUploading.filter((item) => {
              return true
                && item !== `${currentFolderID}-${resumableIdentifier}`;
            });
            const messageScreenTitle = filesUploading.length !== 0
              ? prevState.messageScreenTitle
              : 'Uploading fnished';
            return {
              filesUploading,
              messageScreenTitle,
            };
          });
        })
        .catch(e => this.setState({ error: e }));
    }

    handleKeyPress(event) {
      if (event.keyCode === 27) {
        this.stopDrag(event);
      }
    }

    upload() {
      this.props.resumable.upload();
    }
    pause() {
      this.props.resumable.pause();
    }
    cancel() {
      this.props.resumable.cancel();
    }
    // info() {
    //   console.log(this.props.resumable);
    // }
    refresh() {
      this.props.fetchFileList();
    }

    stopDrag() {
      this.setState(() => {
        return {
          showDropAreaHighlight: false,
        };
      });
    }

    pollUploadedFileProcessedState(resumableIdentifier, parentFolderID) {
      const { token } = this.props;
      // const actAsUser = this.props.actAsUser || null;
      this.actAsUser = this.props.actAsUser || null;

      function* pollUploaded(context) {
        while (true) {
          yield FileShareAPI.getUnfinishedUploads(
            token,
            context.actAsUser,
          )
            .then(response => response.json())
            .then((result) => {
              return result;
            })
            .catch(e => context.setState({ error: e }));
        }
      }

      const MAX_RETRIES = 150;
      const INTERVAL = 650;

      const runPolling = (
        context,
        retriedCount = 0,
        interval = 650,
        maxRetries = 150,
        generator,
      ) => {
        // console.log('runPolling');
        const gen = generator || pollUploaded(context);

        gen.next().value.then((result) => {
          const fileItem = result.uploaded.filter((item) => {
            const test = true
            && `${item.ResumableIdentifier}` === `${resumableIdentifier}`
            && (
              `${item.ParentID}` === `${parentFolderID}`
              || `${item.ParentID}` === `${context.state.rootFolderID}`
            );
            // console.log(test);
            return test;
          });
          if (retriedCount <= maxRetries) {
            if (fileItem.length === 0) {
              setTimeout(
                runPolling,
                interval,
                context,
                retriedCount + 1,
                interval,
                maxRetries,
                generator,
              );
            } else {
              console.log('processing finished');
              context.setUploadfinished(resumableIdentifier, parentFolderID);
            }
          } else {
            console.log('retry limit reached...');
            context.setState({ error: 'retry limit reached...' });
          }
        });
      }

      runPolling(this, 0, INTERVAL, MAX_RETRIES);
      // .then(result => this.tmpCheckList(result, parentFolderID, resumableIdentifier))
    }

    hideMessageScreen() {
      this.setState({ displayMessageScreen: false });
    }

    render() {
      const {
        displayMessageScreen,
        messageScreenTitle,
        allProgress,
        messageScreenHideable,
        showDropAreaHighlight,
      } = this.state;
      const {
        config,
      } = this.props;
      return (
        <div id="appWithUpload">
          <WrappedComponent
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave}
            onDragOver={this.onDragOver}
            {...this.props}
          />
          {showDropAreaHighlight
            && <DroptargetOverlay
              config={config}
              stopDrag={this.stopDrag}
              handleKeyPress={this.handleKeyPress}
            />
          }
          {displayMessageScreen
            &&
            <MessageScreen
              config={config}
              title={messageScreenTitle}
              allProgress={allProgress}
              messageScreenHideable={messageScreenHideable}
              hideMessageScreen={this.hideMessageScreen}
            />
          }
        </div>
      );
    }
  }
  WithUploadEnhancer.propTypes = {
    config: configPropType,
    token: PropTypes.string.isRequired,
    resumable: PropTypes.object.isRequired,
    fetchFileList: PropTypes.func.isRequired,
    currentFolderID: PropTypes.number.isRequired,
    actAsUser: actAsUserType,
  };
  WithUploadEnhancer.defaultProps = {
    config: configDefaultPropType,
    actAsUser: actAsUserDefault,
  };

  return WithUploadEnhancer;
};

export default withUpload;
