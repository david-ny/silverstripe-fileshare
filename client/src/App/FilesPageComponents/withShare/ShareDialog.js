import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, Label } from 'reactstrap';
import Autosuggest from 'react-autosuggest';
import Modal from '../../Components/Modal';
import ShareDialogUser from './ShareDialogUser';
import {
  userVerboseType,
} from '../../types';

class ShareDialog extends Component {
  static enhanceUserInfo(user) {
    const { firstName, lastName, email } = user;
    const hasName = firstName || lastName;
    const fistNamePadded = firstName ? `${firstName} ` : '';
    const displayName = !hasName
      ? email
      : `${fistNamePadded}${lastName || ''}`;
    const displayNamePadded = (displayName !== email)
      ? `${displayName} `
      : '';
    const suggestionText = `${displayNamePadded}<${email}>`;
    const suggestionTextToSeach = `${displayNamePadded}${email}`;
    const enhancedItem = {
      ...user,
      displayName,
      suggestionText,
      suggestionTextToSeach,
    };
    // console.log(enhancedItem);
    return enhancedItem;
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  static getSuggestionValue = suggestion => suggestion.suggestionText;

  // Use your imagination to render suggestions.
  static renderSuggestion = suggestion => (
    <div>
      {suggestion.suggestionText}
    </div>
  );

  constructor(props) {
    super(props);

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    const { fetchKnownUsers, sharedWithUsers } = this.props;

    // console.log('sharedWithUsers');
    // console.log(sharedWithUsers);

    fetchKnownUsers();

    this.state = {
      suggestionFieldValue: '',
      suggestions: [],
      // allPeople: [],
      selectedPeople: sharedWithUsers.map(item =>
        ShareDialog.enhanceUserInfo(item)),
    };

    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.removePeopleClick = this.removePeopleClick.bind(this);
  }

  onChange = (event, { newValue }) => {
    this.setState({
      suggestionFieldValue: newValue,
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  onSuggestionSelected(event, suggestionInfo) {
    const setStateForOnSuggestionSelected = (prevState) => {
      const people = prevState.selectedPeople;
      const newPeople = suggestionInfo.suggestion;
      return {
        selectedPeople: [...people, newPeople],
        suggestionFieldValue: '',
        suggestions: [],
      };
    };
    this.setState(prevState => setStateForOnSuggestionSelected(prevState));
    // console.log(this.state);
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    const { selectedPeople } = this.state;

    return inputLength === 0
      ? []
      : this.knownUserList()
        // do not suggest what's already selected
        .filter((item) => {
          return true && !selectedPeople.find((element) => {
            return element.userID === item.userID;
          });
        }).filter(item =>
          item.suggestionTextToSeach.toLowerCase()
            .search(inputValue) !== -1,
          // .slice(0, inputLength) === inputValue
        );
  };

  knownUserList() {
    const { currentUserID } = this.props;
    return this.props.knownUserList.filter((item) => {
      return true &&
      item.userID !== currentUserID
    }).map(item =>
      ShareDialog.enhanceUserInfo(item));
  }

  removePeopleClick(event, person) {
    event.preventDefault();
    const setStateForRemovePeopleClick = (prevState) => {
      const people = prevState.selectedPeople;
      const newPeople = people.filter((item) => {
        return true && item.userID !== person.userID;
      });

      return {
        selectedPeople: newPeople,
        suggestionFieldValue: '',
        suggestions: [],
      };
    };
    this.setState(prevState => setStateForRemovePeopleClick(prevState));
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { shareFileWithUsers, fileID } = this.props;
    const users = this.state.selectedPeople.map(item => item.userID);
    shareFileWithUsers(fileID, users);
  }


  render() {
    const {
      cancel,
      title,
      fileName,
      // fileID,
    } = this.props;

    const {
      suggestions,
      suggestionFieldValue,
      selectedPeople,
    } = this.state;

    const inputProps = {
      placeholder: 'Add more pepople...',
      value: suggestionFieldValue,
      onChange: this.onChange,
    };

    return (
      <Modal
        title={title}
        cancel={cancel}
      >
        <form onSubmit={this.handleSubmit}>

          <div className="modal-body">
            <span>File name: <strong>{fileName}</strong></span>
            <FormGroup>
              <Label for="shareWithUsers">People:</Label>
              {/* <Input type="textarea" readOnly name="text"
              id="shareWithUsers" value={selectedPeople} /> */}
              <div style={{ border: '1px solid gray', borderRadius: '0.3em' }}>
                {selectedPeople.map(item => (
                  <ShareDialogUser
                    key={item.userID}
                    userData={item}
                    removePeopleClick={this.removePeopleClick}
                  />
                ))}
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                  onSuggestionSelected={this.onSuggestionSelected}
                  getSuggestionValue={ShareDialog.getSuggestionValue}
                  renderSuggestion={ShareDialog.renderSuggestion}
                  inputProps={inputProps}
                />
              </div>
            </FormGroup>
          </div>

          <div className="modal-footer">

            <Button className="button-secondary" onClick={cancel}>Cancel</Button>
            <Button className="button-primary" type="submit">
              {selectedPeople.length > 0
                ? 'Share'
                : 'Don\'t share'
              }
            </Button>
          </div>

        </form>
      </Modal>
    );
  }
}

ShareDialog.propTypes = {
  title: PropTypes.string.isRequired,
  cancel: PropTypes.func.isRequired,
  fileName: PropTypes.string.isRequired,
  fileID: PropTypes.number.isRequired,
  shareFileWithUsers: PropTypes.func.isRequired,
  knownUserList: PropTypes.arrayOf(userVerboseType).isRequired,
  fetchKnownUsers: PropTypes.func.isRequired,
  sharedWithUsers: PropTypes.arrayOf(userVerboseType).isRequired,
  currentUserID: PropTypes.number.isRequired,
};
ShareDialog.defaultProps = {
  // config: configDefaultPropType,
};

export default ShareDialog;
