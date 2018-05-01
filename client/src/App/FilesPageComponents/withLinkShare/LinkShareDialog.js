import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, Label, Input } from 'reactstrap';
import Modal from '../../Components/Modal';


class LinkShareDialog extends Component {
  static copyLinkToClipboard() {
    const copyText = document.getElementById('linkToShare');
    copyText.select();
    document.execCommand('Copy');
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { enableSharedLinkAndClose, fileID, linkID } = this.props;
    LinkShareDialog.copyLinkToClipboard();
    enableSharedLinkAndClose(fileID, linkID);
  }

  render() {
    const {
      enableSharedLink,
      deleteSharedLinkAndClose,
      cancel,
      title,
      fileName,
      fileID,
      linkID,
      link,
      linkActive,
    } = this.props;
    const copyOrActivate = linkActive
      ? (
        <Button
          className="button-secondary"
          onClick={LinkShareDialog.copyLinkToClipboard}
        >
          Copy link
        </Button>
      )
      : (
        <Button
          className="button-secondary"
          onClick={() => enableSharedLink(fileID, linkID, fileName)}
        >
          Activate link
        </Button>
      );
    const activateOrClose = linkActive
      ? (
        <Button
          type="submit"
          className="button-primary"
        >
          Copy link and Close
        </Button>
      )
      : (
        <Button
          type="submit"
          className="button-primary"
        >
          Copy link and Activate
        </Button>
      );
    return (
      <Modal
        title={title}
        cancel={cancel}
      >
        <form onSubmit={this.handleSubmit}>

          <div className="modal-body">
            <span>File name: <strong>{fileName}</strong></span>
            <FormGroup>
              <Label for="exampleText">Link:</Label>
              <Input type="textarea" name="text" id="linkToShare" readOnly value={link} />
            </FormGroup>

            {copyOrActivate}{`${' '}`}
            <Button
              className="button-secondary"
              onClick={() => deleteSharedLinkAndClose(fileID, linkID)}
            >
                Delete link
            </Button>
          </div>

          <div className="modal-footer">

            <Button className="button-secondary" onClick={cancel}>Cancel</Button>
            {activateOrClose}
          </div>

        </form>
      </Modal>
    );
  }
}

LinkShareDialog.propTypes = {
  fileID: PropTypes.number.isRequired,
  linkID: PropTypes.string.isRequired,
  enableSharedLinkAndClose: PropTypes.func.isRequired,
  enableSharedLink: PropTypes.func.isRequired,
  deleteSharedLinkAndClose: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  fileName: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  linkActive: PropTypes.bool.isRequired,
};


export default LinkShareDialog;
