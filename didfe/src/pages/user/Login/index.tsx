import React, { useState, useRef, useEffect } from 'react';
import { Alert, message } from 'antd';
import { ProFormText, LoginForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { history, useModel } from 'umi';
import { didAbi, didBytecode } from '@/utils';
import styles from './index.less';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<DID.LoginResult>({});
 
  const { initialState, setInitialState } = useModel('@@initialState');
  
  const { web3, account } = initialState;

  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    formRef?.current?.setFieldsValue({
      account: account,
    });
  }, [account])
  
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();

    if (userInfo) {
      await setInitialState((s) => ({ ...s, ...{currentUser: userInfo }}));
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      
      const defaultLoginSuccessMessage = '登录成功！';
      message.success(defaultLoginSuccessMessage);
      await fetchUserInfo();
      /** 此方法会跳转到 redirect 参数所在的位置 */

      if (!history) return;
      const { query } = history.location;
      const { redirect } = query as {
        redirect: string;
      };
      history.push(redirect || '/');

    } catch (error) {
      console.log("login error", error);
      const defaultLoginFailureMessage = '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  const createDid = async () => {
    if(!account) {
      setUserLoginState({status: 'error', msg: '请先链接 MetaMask 账户'  });
      return;
    }
    const didContract = new web3.eth.Contract(didAbi);
    const didInstance = await didContract.deploy({data: didBytecode.object}).send({
      from: account
    });
    // myContract.options.address
    console.log(didInstance);
  }

  const requestAccounts = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  const { status, msg } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          formRef={formRef}
          logo={<img alt="logo" src="/icons/icon-280x280.png" />}
          title="DID 管理系统"
          subTitle={'基于以太坊的数字身份管理系统'}
          initialValues={{
            // account: account,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <ProFormText 
            disabled
            width="lg"
            name="account"
            required
            // addonBefore={<a>客户名称应该怎么获得？</a>}
            addonAfter={<a onClick={requestAccounts} >链接</a>} 
            label="链接 MetaMask 账户"
            placeholder="未连接"
            rules={[{ required: true, message: '这是必填项' }]}
          />

          <ProFormText 
            width="lg"
            name="didContract"
            required
            addonAfter={
                <a onClick={createDid} >创建</a>
            } 
            tooltip="输入此账户的 DID 地址或创建一个新的 DID"
            label="此账户的 DID 合约地址"
            placeholder=""
            rules={[{ required: true, message: '这是必填项' }]}
          />

          {status === 'error' && (
            <LoginMessage content={msg} />
          )}
          
        </LoginForm>
     
      </div>
    </div>
  );
};

export default Login;
