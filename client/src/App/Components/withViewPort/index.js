import React from 'react';
// import PropTypes from 'prop-types';
import ViewPort from '../../../utils/ViewPort';

const withViewPort = (WrappedComponent) => {
  class WithViewPortEnhancer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        viewPortClass: '',
        smallViewPort: false,
      };
      this.updateViewPort = this.updateViewPort.bind(this);
    }

    componentDidMount() {
      ViewPort.registerObserver(this);
      ViewPort.init();
      this.updateViewPort();
    }

    updateViewPort() {
      const viewPortClass = ViewPort.getClass();
      const smallViewPort = viewPortClass === 'xs' || viewPortClass === 'sm';
      this.setState(() => {
        return { viewPortClass, smallViewPort };
      });
    }

    render() {
      const { viewPortClass, smallViewPort } = this.state;
      const viewPort = {
        class: viewPortClass,
        isSmall: smallViewPort,
      };
      return (
        <WrappedComponent
          viewPort={viewPort}
          {...this.props}
        />
      );
    }
  }

  return WithViewPortEnhancer;
};

export default withViewPort;
