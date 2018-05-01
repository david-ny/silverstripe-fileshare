import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Button,
  Form,
  FormGroup,
  FormFeedback,
  Input,
} from 'reactstrap';
import { PATH_APP_BASE } from '../../Config/constants';
import { configPropType } from '../../types';


export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  }

  handleSubmit = (event) => {
    const { login } = this.props;
    event.preventDefault();
    const { email, password } = this.state;
    login(email, password);
  }

  render() {
    const { config, failedLogin } = this.props;
    return (
      <div className="login-bg">
        <Container className="Login">
          <a className="logo" href={PATH_APP_BASE}>
            <img src={config.app.logo.src} alt={config.app.logo.alt} />
          </a>
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Input
                invalid={failedLogin}
                placeholder="Email"
                id="email"
                autoFocus
                type="email"
                name="email"
                value={this.state.email}
                onChange={event => this.handleChange(event)}
              />
            </FormGroup>
            <FormGroup>
              <Input
                invalid={failedLogin}
                id="password"
                placeholder="Password"
                type="password"
                name="password"
                value={this.state.password}
                onChange={event => this.handleChange(event)}
              />
              {failedLogin &&
                <FormFeedback>Invalid username or password.</FormFeedback>
              }
            </FormGroup>

            <Button
              block
              disabled={!this.validateForm()}
              type="submit"
            >
              Login
            </Button>
          </Form>
        </Container>
      </div>
    );
  }
}

LoginPage.propTypes = {
  config: configPropType.isRequired,
  failedLogin: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
};
