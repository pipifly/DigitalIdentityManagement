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
import {Chains, verifyOwner, didAbi} from '@/utils';

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
  fetchDidInfo?: (account: string | undefined) => Promise<DID.DidInfo | undefined>;
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
      return accounts[0];
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchUserInfo = async () => {
    try {
      return   {
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
      };
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchDidInfo = async (account: string | undefined): Promise<DID.DidInfo | undefined> => {
    try {
      if(!account) throw("no account")
      let accountMapDidAddress = JSON.parse(window.localStorage.getItem("ama") || '{}');
      const didAddress = accountMapDidAddress[account];
      if(didAddress) {
        const isOwner = await verifyOwner(web3, didAddress, didAbi, account);
        if(isOwner === false) throw("did owner changed");

        let didsInfo: DID.DidInfo[] = JSON.parse(window.localStorage.getItem('didsDict') || '{}');
        if(didsInfo[didAddress]) {
          return didsInfo[didAddress];
        } else {
          throw("goto login connect account with did")
        }
        
      } 
      throw("account does not has a did")
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  }

  const currentAccount = await fetchAccountInfo();
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentDidInfo = await fetchDidInfo(currentAccount);
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      fetchDidInfo,
      settings: defaultSettings,
      web3: web3,
      account: currentAccount,
      didInfo: currentDidInfo,
    };
  }
  return {
    fetchUserInfo,
    fetchDidInfo,
    settings: defaultSettings,
    web3: web3,
    account: currentAccount
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
            setInitialState((s) => ({ ...s, account: Web3.utils.toChecksumAddress(selectedAccount) }));
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
