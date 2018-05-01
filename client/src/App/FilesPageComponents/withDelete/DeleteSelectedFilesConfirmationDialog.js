import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Modal from '../../Components/Modal';


class DeleteSelectedFilesConfirmationDialog extends Component {
  handleSubmit = (event) => {
    event.preventDefault();
    const { selectedFiles, deleteFiles } = this.props;
    deleteFiles(selectedFiles);
  }

  render() {
    const { cancel, title, selectedFiles } = this.props;
    return (
      <Modal
        title={title}
        cancel={cancel}
      >
        <form onSubmit={this.handleSubmit}>

          <div className="modal-body">
            <span>
            Are you sure you want to delete theese&nbsp;
              <strong>{`${selectedFiles.length}`}</strong> items?&nbsp;
            </span>
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

DeleteSelectedFilesConfirmationDialog.propTypes = {
  selectedFiles: PropTypes.arrayOf(PropTypes.number).isRequired,
  deleteFiles: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default DeleteSelectedFilesConfirmationDialog;
