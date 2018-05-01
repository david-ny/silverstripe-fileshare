import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  Input,
} from 'reactstrap';
// import "./Login.css";
import Modal from '../../Components/Modal';


class NewFolderDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      folderName: '',
    };
  }

  validateForm() {
    return this.state.folderName.length > 0;
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { createFolder, currentFolderID } = this.props;
    const { folderName } = this.state;
    createFolder(folderName, currentFolderID);
  }

  render() {
    const { cancel, title } = this.props;
    return (
      <Modal
        title={title}
        cancel={cancel}
      >
        <form onSubmit={this.handleSubmit}>
          <div className="modal-body">
            <FormGroup>
              {/* <ControlLabel>New folder</ControlLabel> */}
              <Input
                autoFocus
                id="folderName"
                value={this.state.folderName}
                onChange={event => this.handleChange(event)}
                type="text"
              />
            </FormGroup>
          </div>
          <div className="modal-footer">
            <Button className="button-secondary" onClick={cancel}>Cancel</Button>
            <Button
              type="submit"
              disabled={!this.validateForm()}
              className="button-primary"
            >
                Create
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
}

NewFolderDialog.propTypes = {
  currentFolderID: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  createFolder: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};


export default NewFolderDialog;
