import React, { useEffect } from 'react';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import defaultSettings from '../config/defaultSettings';
import Web3 from 'web3';
import Chains from './utils/chains';

const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  web3?: any;
  account?: string;
  currentAccount?: DID.CurrentAccount;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  console.log("app.tsx getInitialState");

  const setChainId = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        // params: [{ chainId: '0x89'}]
          params: [{ chainId: Chains.Ropsten.ChainId}]
      });
    } catch (error: any) {
      if(error.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: Chains.Ropsten.ChainId,
              rpcUrl: Chains.Ropsten.rpcUrl,
            }]
          })
      }
    }
  }

  const fetchAccountInfo = async () => {
    const { ethereum } = window;
    try {
      await setChainId(ethereum);
      const web3 = new Web3(ethereum);
      const accounts = await web3.eth.getAccounts();

      console.log("accounts", accounts);
      if (accounts.length === 0) throw "account undefined";
      return {web3: web3, account: accounts[0], }
    } catch (error) {
      console.log(error);
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentAccount = await fetchAccountInfo();
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
      ...currentAccount
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      useEffect(() => {
        if(window.ethereum) {
          // window.ethereum.on('chainChanged', () => {
          //   window.location.reload();
          // })
          window.ethereum.on('accountsChanged', () => {
            if(!props.location?.pathname?.includes('/login'))
              window.location.reload();
          })
        }
      });

      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};
