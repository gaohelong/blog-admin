import React from 'react';
import styles from './index.module.scss';

import { Form, Icon, Input, Button, notification } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { RouteComponentProps } from 'react-router';
import { LoginButton } from './Button';
import { LOGIN } from './query';
import ApolloClient from 'apollo-client';

export interface Variables {
  username: string;
  password: string;
}

interface LoginState {
  loading: boolean;
}

interface Response {
  login: {
    lifeTime: number;
    token: string;
  };
}

interface UserFormProps
  extends FormComponentProps,
    RouteComponentProps,
    Variables {}

class Login extends React.Component<UserFormProps, LoginState> {
  state = {
    loading: false
  };

  handleSubmit = (e: React.MouseEvent, client: ApolloClient<any>) => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({
          loading: true
        });
        const {
          data: { login },
          errors
        } = await client.query<Response, Variables>({
          query: LOGIN,
          variables: values,
          errorPolicy: 'all'
        });
        this.setState({
          loading: false
        });

        errors &&
          notification.error({
            message: 'GraphQL error',
            description: errors.map(
              ({ message }) => `Message: ${message.message}`
            ),
            duration: 5
          });

        if (login) {
          window.localStorage.setItem('TOKEN', JSON.stringify(login));
          const path = this.props.location.state.from.pathname;
          this.props.history.push(path || '/dashboard');
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.container}>
        <Form className={styles.form}>
          <Form.Item hasFeedback>
            {getFieldDecorator('username', {
              rules: [
                { required: true, message: '请输入姓名' },
                { min: 6, message: '最小长度为 6 位' }
              ]
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                placeholder="Username"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: 'Please input your Password!' }
              ]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                type="password"
                placeholder="Password"
              />
            )}
          </Form.Item>
          <Form.Item>
            <LoginButton
              type="primary"
              htmlType="submit"
              className={styles['form-button']}
              login={this.handleSubmit}
              loading={this.state.loading}
            >
              Log in
            </LoginButton>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default Form.create()(Login);
