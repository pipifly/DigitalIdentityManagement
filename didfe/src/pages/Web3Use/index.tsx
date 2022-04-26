import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Card, Alert, Typography, Button } from 'antd';
import Chains from '../../utils/chains';
import styles from './index.less';
import Web3 from 'web3';
import { signString  } from '@/utils';

const Web3Use: React.FC = () => {

  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string>();

  const { ethereum } = window;
  const web3 = new Web3(ethereum);
  

  useEffect(() => {
    (async function getInitialState() {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          // params: [{ chainId: '0x89'}]
            params: [{ chainId: Chains.Ropsten.ChainId}]
        });
      } catch (error: any) {
        console.log(error)
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
      // setAccounts(await ethereum.enable());
      setAccounts(await web3.eth.getAccounts());
    }
    )()
  }, [])

  console.log("ethereum", ethereum);

  const signString1 = (content: string) => {
    const dataHex = Web3.utils.utf8ToHex(content);
    const sha_hash = Web3.utils.soliditySha3(dataHex);
    // const signature = web3.eth.sign(String(sha_hash), accounts[0]);
    const signature = web3.eth.sign(String(sha_hash), "0x73d6189c34C0A357A5850f315eE2120be1F2E5cd");
    return signature;
  }

  const signData = async (data: any) => {
    const string = JSON.stringify(data);
    console.log(await signString(string, web3, "0x73d6189c34C0A357A5850f315eE2120be1F2E5cd"));
  }

  const getAccounts = async () => {
    const permitedAccounts = await ethereum.enable();
    console.log("permitedAccounts", permitedAccounts);
    setAccounts(permitedAccounts);
  }

  return (
    <PageContainer
      // content="使用Web3js"
    >
      <ProCard direction="column" title="信息">
        <span style={{display: "block"}}>网络名: {ethereum && ethereum.chainId}</span>
        <span style={{display: "block"}}>链接地址: {accounts.length > 0 && accounts[0]}</span>
        {/* <span style={{display: "block"}}>web3.eth.accounts.wallet: {web3.eth.accounts.wallet}</span> */}
      </ProCard>
      <ProCard direction="column"  ghost gutter={[0, 8]}>
        <ProCard style={{ marginTop: 8 }} gutter={8} title="24栅格">
          <ProCard colSpan={12} layout="center" bordered>
            <Button
              onClick={getAccounts}
            >
              链接钱包
            </Button>
          </ProCard>
          <ProCard colSpan={12} layout="center" bordered>
            <Button
              onClick={() => { signData({
                "name": "张三",
                "stuId": 124346356,
                "major": "cs"
              }) }}
            >
              为json数据签名
            </Button>
          </ProCard>
        </ProCard>

      </ProCard>
      
    </PageContainer>
  );
};

export default Web3Use;
