import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
  configPropType,
  configDefaultPropType,
  viewPortType,
  currentPathType,
} from '../../types';

class Breadcrumbs extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  pathTextLength() {
    const { rootElement, currentPath } = this.props;
    const textLength = currentPath.reduce((acc, curr) => {
      // console.log(curr);
      return acc + curr.name.length;
    }, 0);
    return rootElement.length + textLength;
  }

  showFullBreadcrumbs() {
    return this.pathTextLength() < 47;
  }

  toggleButtonText() {
    const { currentPath, rootElement, viewPort } = this.props;
    const getMaxLength = () => {
      switch (viewPort.class) {
        case 'xs': return 12;
        case 'sm': return 28;
        default: return 12;
      }
    };
    const maxLength = getMaxLength();
    const text = currentPath[currentPath.length - 1]
      ? currentPath.slice().reverse()[0].name
      : rootElement;
    return viewPort.isSmall && text.length > maxLength
      ? `${text.substr(0, maxLength - 1)} ...`
      : text;
  }

  render() {
    const {
      config,
      viewPort,
      rootElement,
      currentPath,
      pathClickRoot,
      pathClick,
    } = this.props;
    return (
      <span className="breadcrumbs">

        {(viewPort.isSmall || !this.showFullBreadcrumbs()) &&
          <ButtonDropdown

            isOpen={this.state.dropdownOpen}
            toggle={this.toggle}
          >
            <DropdownToggle caret={currentPath.length > 0}>
              <img src={`${config.app.imagePath}/folder.svg`} alt="folder" />
              <span>
                {this.toggleButtonText()}
              </span>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                key={-2}
                onClick={pathClickRoot}
              >
                <img src={`${config.app.imagePath}/folder.svg`} alt="folder" />
                {rootElement}
              </DropdownItem>
              {currentPath.length > 0 &&
                <DropdownItem
                  divider
                  key={-1}
                />
              }
              {currentPath.map((item, index) => (
                <DropdownItem
                  key={item.ID}
                  onClick={() => pathClick(item.ID)}
                  style={{ paddingLeft: `${(index + 1) * 0.4}em` }}
                >
                  <img src={`${config.app.imagePath}/folder.svg`} alt="folder" />
                  {item.name}
                </DropdownItem>


              ))}


            </DropdownMenu>
          </ButtonDropdown>
        }

        {(!viewPort.isSmall && this.showFullBreadcrumbs()) &&
          <span>
            <Button
              className="text-button"
              key={-1}
              type="button"
              onClick={pathClickRoot}
            >
              {rootElement}
            </Button>

            {currentPath.map(item => (
              <Button
                className="text-button"
                key={item.ID}
                type="button"
                onClick={() => pathClick(item.ID)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <title>arrow-right</title>
                  <path
                    d="M10.414 7.05l4.95 4.95-4.95 4.95L9 15.534 12.536 12 9 8.464z"
                    fill="#637282"
                    fillRule="evenodd"
                  />
                </svg>
                {item.name}
              </Button>
              ))}
          </span>
        }
      </span>
    );
  }
}

Breadcrumbs.propTypes = {
  config: configPropType,
  rootElement: PropTypes.string.isRequired,
  currentPath: currentPathType.isRequired,
  pathClickRoot: PropTypes.func.isRequired,
  pathClick: PropTypes.func.isRequired,
  viewPort: viewPortType.isRequired,
};
Breadcrumbs.defaultProps = {
  config: configDefaultPropType,
};

export default Breadcrumbs;
