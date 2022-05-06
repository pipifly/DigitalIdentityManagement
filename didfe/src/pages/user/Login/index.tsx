import React, { useState, useRef, useEffect } from 'react';
import { Alert, message, Spin } from 'antd';
import { ProFormText, LoginForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { history, useModel } from 'umi';
import { didAbi, didBytecode, verifyOwner } from '@/utils';
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
  const [ spinState, setSpinState ] = useState<DID.SpinState>({spinning: false})
  const { web3, account, fetchDidInfo } = initialState;

  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    (async () => {
      const didInfo = await fetchDidInfo(account);
      console.log(account, didInfo);
      formRef?.current?.setFieldsValue({
        account: account,
        didAddress: didInfo && didInfo.address
      });
    }
    )()
  }, [account])

  const fetchUserInfo = async () => {
    const userInfo =  {
        name: 'admin',
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        userid: '00000001',
        email: 'antdesign@alipay.com',
        signature: '海纳百川，有容乃大',
        title: '交互专家',
        group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
        tags: [
          {
            key: '0',
            label: '很有想法的',
          },
          {
            key: '1',
            label: '专注设计',
          }
        ],
        notifyCount: 12,
        unreadCount: 11,
        country: 'China',
        access: 'admin',
        geographic: {
          province: {
            label: '浙江省',
            key: '330000',
          },
          city: {
            label: '杭州市',
            key: '330100',
          },
        },
        address: '西湖区工专路 77 号',
        phone: '0752-268888888',
      }
    

    if (userInfo) {
      await setInitialState((s) => ({ ...s, ...{currentUser: userInfo }}));
    }
  };

  
  const handleSubmit = async (values) => {
    try {
      const { account, didAddress } = values;
      setSpinState({spinning: true, tip: "验证 DID 是否属于此账户"});
      const isOwner = await verifyOwner(web3, didAddress, didAbi, account);
      setSpinState({spinning: false});
      if(isOwner === false) {
        setUserLoginState({status: 'error', msg: 'DID 不属于此账户'});
        return
      } 
      let didInfo: DID.DidInfo = {
        address: didAddress,
        createdVcs: [],
        holdedVcs: [],
      };
      let accountMapDidAddress = JSON.parse(window.localStorage.getItem("ama") || '{}');
      accountMapDidAddress[account] = didAddress;
      window.localStorage.setItem('ama', JSON.stringify(accountMapDidAddress));

      let didsInfo: DID.DidInfo[] = JSON.parse(window.localStorage.getItem('didsDict') || '{}');
      if(didAddress in didsInfo === false ) {
        didsInfo[didAddress] = {
          address: didAddress,
          createdVcs: [],
          holdedVcs: [],
        };
      };
      window.localStorage.setItem('didsDict', JSON.stringify(didsInfo));
      
      await setInitialState((s) => ({ ...s, didInfo: didInfo })); 

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
      const defaultLoginFailureMessage = '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  const createDid = async () => {
    if(!account) {
      setUserLoginState({status: 'error', msg: '请先链接 MetaMask 账户'});
      return;
    }
    try {
      setSpinState({spinning: true, tip: "正在创建 DID 智能合约"});
      const didContract = new web3.eth.Contract(didAbi);
      const didInstance = await didContract.deploy({data: didBytecode.object}).send({
        from: account
      });
      formRef?.current?.setFieldsValue({
        didAddress: didInstance.options.address,
      });
      
    } catch (error) {
    } finally {
      setSpinState({spinning: false});
    }

  }

  const requestAccounts = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  const { status, msg } = userLoginState;
  const { spinning, tip } = spinState;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Spin spinning={spinning} tip={tip} >
          <LoginForm
            formRef={formRef}
            logo={<img alt="logo" src="/icons/icon-280x280.png" />}
            title="DID 管理系统"
            subTitle={'基于以太坊的数字身份管理系统'}
            initialValues={{
              // account: account,
            }}
            onFinish={async (values) => {
              await handleSubmit(values);
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
              name="didAddress"
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
        </Spin>
      </div>
    </div>
  );
};

export default Login;
