import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import User from './index';
import { configTestData } from '../../test/testData';

const props = configTestData;

describe('User', () => {
  it('renders without crashing', () => {
    const tbody = document.createElement('tbody');
    ReactDOM.render(<User {...props} />, tbody);
  });
  test('has a valid snapshot', () => {
    const component = renderer.create(
      <User {...props} />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
