import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App/App';
import Config from './App/Config/Config';

const config = Config.getConfig();
const appNode = document.getElementById('app');

ReactDOM.render(
  <App config={config} />,
  appNode,
);

if (module.hot) {
  module.hot.accept();
}
