import React from 'react';
import PropTypes from 'prop-types';

const Modal = ({
  title,
  footer,
  children,
  cancel,
}) => (
  <div className="modal fade" id="Modal" style={{ display: 'block', opacity: 1, background: 'rgba(255,255, 255, 0.85)' }}>
    <div className="modal-dialog">
      <div className="modal-content">

        {title &&
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
          <button onClick={cancel} type="button" className="close" data-dismiss="modal">&times;</button>
        </div>}

        {children}

        {footer &&
        <div className="modal-footer">
          {footer}
        </div>}

      </div>
    </div>
  </div>
);

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  footer: PropTypes.node,
  children: PropTypes.node.isRequired,
  cancel: PropTypes.func.isRequired,
};
Modal.defaultProps = {
  footer: '',
};

export default Modal;
