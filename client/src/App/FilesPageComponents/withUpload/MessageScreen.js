import React from 'react';
import PropTypes from 'prop-types';

const MessageScreen = ({
  title,
  allProgress,
  messageScreenHideable,
  hideMessageScreen,
}) => {
  const style = { width: `${allProgress * 100}%` };
  return (
    <div className="message-screen">
      <header>
        {title}
        {messageScreenHideable &&
          <input
            onClick={hideMessageScreen}
            type="button"
            value="hide"
            className="button-inline msg-scr-hide"
          />
        }
      </header>
      <div className="progress">
        <div className="progress-bar">
          <div
            className="indicator"
            style={style}
          >
            <span className="progress-percent">
              {Math.round(allProgress * 100)} %
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

MessageScreen.propTypes = {
  title: PropTypes.string.isRequired,
  allProgress: PropTypes.number.isRequired,
  messageScreenHideable: PropTypes.bool.isRequired,
  hideMessageScreen: PropTypes.func.isRequired,
};


export default MessageScreen;
