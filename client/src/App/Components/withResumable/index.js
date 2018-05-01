import React from 'react';
import PropTypes from 'prop-types';
import Resumable from 'resumablejs';
import {
  PATH_API,
  PATH_API_UPLOAD,
} from '../../Config/constants';

const withResumable = (WrappedComponent) => {
  class WithResumableEnhancer extends React.Component {
    static chunkSize() {
      const appNode = document.getElementById('app');
      const fileUploadMaxSize = appNode.getAttribute('data-fileuploadmaxsize')
        || 524288; // 0.5*1024*1024
      const maxChunkSize = (30 * 1024 * 1024); // 30Mb
      const serverMaxChunkSize = Math.round(fileUploadMaxSize * 0.84);
      return serverMaxChunkSize > maxChunkSize
        ? maxChunkSize
        : serverMaxChunkSize;
      // const chunkSize = 524288;
    }

    static getResumable(token) {
      const target = `${PATH_API}${PATH_API_UPLOAD}`;
      return new Resumable({
        // target: 'fileshare/code/upload.php',
        target,
        // query: { upload_token: 'my_token' },
        chunkSize: WithResumableEnhancer.chunkSize(), // 0.5*1024*1024
        forceChunkSize: true,
        headers: {
          'X-Silverstripe-Apitoken': token,
        },
        // simultaneousUploads: 1,
        // testChunks: false,
      });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      const oldToken = prevState.resumable.opts.headers['X-Silverstripe-Apitoken'];
      const { token } = nextProps;
      return oldToken !== token
        ? {
          resumable: WithResumableEnhancer.getResumable(token),
        }
        : null;
    }

    constructor(props) {
      super(props);

      this.state = {
        resumable: WithResumableEnhancer.getResumable(this.props.token),
      };
    }

    render() {
      const { resumable } = this.state;
      return (
        <WrappedComponent
          resumable={resumable}
          {...this.props}
        />
      );
    }
  }

  WithResumableEnhancer.propTypes = {
    token: PropTypes.string,
  };
  WithResumableEnhancer.defaultProps = {
    token: null,
  };

  return WithResumableEnhancer;
};

export default withResumable;
