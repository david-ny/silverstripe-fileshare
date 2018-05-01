import React from 'react';
import PropTypes from 'prop-types';
import { configPropType, configDefaultPropType } from '../../types';


class DroptargetOverlay extends React.Component {
  componentDidMount() {
    const { handleKeyPress } = this.props;
    document.addEventListener('keypress', handleKeyPress, false);
  }
  componentWillUnmount() {
    const { handleKeyPress } = this.props;
    document.removeEventListener('keypress', handleKeyPress, false);
  }
  render() {
    const { config, stopDrag, handleKeyPress } = this.props;
    return (
      <div
        className="droptarget-overlay"
        onClick={event => stopDrag(event)}
        onKeyPress={event => handleKeyPress(event)}
        role="button"
        tabIndex={0}
      >
        <div>
          <img className="cloud" src={`${config.app.imagePath}/cloud-upload.svg`} alt="WellCom logo" />
          <span>Drop files to instantly upload them</span>
        </div>
      </div>
    );
  }
}
DroptargetOverlay.propTypes = {
  config: configPropType,
  handleKeyPress: PropTypes.func.isRequired,
  stopDrag: PropTypes.func.isRequired,
};
DroptargetOverlay.defaultProps = {
  config: configDefaultPropType,
};

export default DroptargetOverlay;
