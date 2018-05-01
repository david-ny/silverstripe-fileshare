import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Modal from '../../Components/Modal';

class DeleteFileConfirmationDialog extends Component {
  handleSubmit = (event) => {
    event.preventDefault();
    const { deleteFile, fileID } = this.props;
    // console.log('DeleteFileConfirmationDialog . handleSubmit fileID' );
    // console.log(fileID);
    deleteFile(fileID);
  }

  render() {
    const {
      cancel,
      title,
      fileName,
      type,
      folderNotEmpty,
    } = this.props;
    return (
      <Modal
        title={title}
        cancel={cancel}
      >
        <form onSubmit={this.handleSubmit}>

          <div className="modal-body">
            {(type === 'Folder' && folderNotEmpty) &&
              <span>
                The folder <strong>{fileName}</strong> is not empty.<br />
                Are you sure you want to delete this folder and everything in it?
              </span>
            }
            {(type === 'Folder' && !folderNotEmpty) &&
              <span>
                Are you sure you want to delete the folder&nbsp;
                <strong>{fileName}</strong>?
              </span>
            }
            {(type === 'File') &&
              <span>
                Are you sure you want to delete&nbsp;
                <strong>{fileName}</strong> from your your files?
              </span>
            }
          </div>

          <div className="modal-footer">
            <Button
              onClick={cancel}
              className="button-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="button-primary"
            >
              Delete
            </Button>
          </div>

        </form>
      </Modal>
    );
  }
}

DeleteFileConfirmationDialog.propTypes = {
  fileID: PropTypes.number.isRequired,
  fileName: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  folderNotEmpty: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  deleteFile: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};

export default DeleteFileConfirmationDialog;
