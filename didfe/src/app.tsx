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
  web3?: Web3;
  account?: string;
  didInfo?: DID.DidInfo;
  currentAccount?: DID.CurrentAccount;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  console.log("app.tsx getInitialState");
  const { ethereum } = window;
  const web3 = new Web3(window.ethereum);

  const setChainId = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        // params: [{ chainId: '0x89'}]
          params: [{ chainId: Chains.Rinkeby.ChainId}]
      });
    } catch (error: any) {
      if(error.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: Chains.Rinkeby.ChainId,
              rpcUrl: Chains.Rinkeby.rpcUrl,
            }]
          })
      }
    }
  }

  const fetchAccountInfo = async () => {
    
    try {
      await setChainId(ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) throw "account undefined";
      return { account: accounts[0] }
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
  const currentAccount = await fetchAccountInfo();
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
      web3: web3,
      ...currentAccount
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
    web3: web3,
    ...currentAccount
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
          // window.ethereum.on('chainChanged', (networkId) => {
          //   window.location.reload();
          // })
          window.ethereum.on('accountsChanged', async () => {
            const selectedAccount = await window.ethereum.selectedAddress;
            // console.log("selectedAccount", selectedAccount);
            setInitialState((s) => ({ ...s, account: selectedAccount }));
            if(!selectedAccount) {
              history.push(loginPath);
              return;
            }
            if(!props.location?.pathname?.includes('/login'))
              window.location.reload();
          })
        }
      });

      return (
        <>
          {children}
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
        </>
      );
    },
    ...initialState?.settings,
  };
};
