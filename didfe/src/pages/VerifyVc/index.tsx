import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Modal, Spin, Input, Button, message, Drawer } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useModel } from 'umi';
import { recoverPublicKey, publicKeyToAccount, queryVcEnabled } from '@/utils'
import { getVc, deleteVc } from '@/services/did/api';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
const { TextArea } = Input;

const VerifyVc: React.FC = () => {

  const { initialState, setInitialState } = useModel('@@initialState');
  const [vcContent, setVcContent] = useState<string>("");
  const [spinState, setSpinState] = useState<DID.SpinState>({spinning: false})
  const [vcList, setVcList] = useState<DID.VcDocument[]>([]);
  const [currentVc, setCurrentVc] = useState<DID.VcDocument>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const getVcList = async () => {
    const hide = message.loading('正在获取待验证 VC')
    const didaddr = initialState?.didInfo?.address;
    try{
      const res = await getVc({ todid: didaddr, type: 1});
      setVcList(res);
      hide()
      message.success('获取成功')
    } catch(error) {
      hide()
      message.error("获取 VC 失败")
      return false;
    }

  }

  const onDeleteVc = async (vcdoc: DID.VcDocument) => {
    const hide = message.loading('正在删除')
    const didaddr = initialState?.didInfo?.address;
    try{
      const res = await deleteVc([{ todid: didaddr, type: 1, vcsig: vcdoc.proof.signature}]);
      console.log("deletevc res", res);
      hide()
      message.success('删除成功');
      // getVcList();
    } catch(error) {
      hide()
      message.error("获取 VC 失败")
      return false;
    }
  }

  useEffect(() => {
    getVcList();
  }, [])

  const verifySig = (info: DID.VcInfo, proof: DID.VcProof): boolean => {

    const pubKey = recoverPublicKey(JSON.stringify(info), proof.signature, parseInt(proof.signature.slice(130, 132), 16) - 27);
    const recoverAccount = publicKeyToAccount(pubKey);
    console.log(proof.creator, recoverAccount);
    if(proof.creator.toLowerCase() === recoverAccount.toLowerCase()) 
      return true;

    return false;
  };


  const verifyVc = async (jsonData: DID.VcDocument) => {
    if(!jsonData) return;
    // const  = JSON.parse(vcContent);
    const { info, proof } = jsonData;
    setSpinState({spinning: true, tip: "正在验证此 VC 是否启用"});
    if(verifySig(info, proof)){
      if(await queryVcEnabled(proof.signature, initialState?.web3, initialState?.didInfo?.address)) {

        message.success('验证成功');
      }
      else {
        message.error("此 VC 未启用")
      }  
    } else {
    message.error("验证 VC 签名失败");
    }
    setSpinState({spinning: false});
  };

  const { spinning, tip } = spinState;
  const CardList = vcList.map((item, index) => {
    const {info, proof} = item;
    return (       
      <ProCard
        key={index}
        title={`${info.holder.slice(0, 6)}...${info.holder.slice(-4, )}`}
        // hoverable
        style={{ maxWidth: 300, display: 'inline-block', marginRight: '20px', marginBottom: '20px'  }}
        actions={[
          <EyeOutlined  key="eye" onClick={() => {
            setCurrentVc(item);
            setShowDetail(true);
          } } />,
          <DeleteOutlined  key="delete" onClick={() => {
            onDeleteVc(item);
          } } />,
        ]}
        extra={info.type}
        onClick={() => {

        }}
      >
        <div>{`持有人: ${info.holder.slice(0, 6)}...${info.holder.slice(-4, )}`}</div>
        <div>{`创建时间: ${info.issuanceDate}`}</div>
        <div>{`签名: ${proof.signature.slice(0, 10)}`}</div>
      </ProCard>
    )
  })
  return (
    <PageContainer>
      <Button
        type="primary"
        style={{
          display: 'block',
          marginBottom: '20px'
        }}
        onClick={() => {
          setModalVisible(true);
        }}
      >
        输入验证
      </Button>

      {CardList}

      <Modal
        title='输入VC文档验证'
        visible={modalVisible}
        maskClosable
        closable={false}
        onCancel={() => { setModalVisible(false); }}
        destroyOnClose
      >
        <Spin spinning={spinning} tip={tip}>
          <TextArea 
            rows={18} 
            autoSize={true}
            onChange={(e) => { 
              setVcContent(e.target.value); 
            }} 
          />
          <Button style={{marginTop: 24}} onClick={() => {verifyVc(JSON.parse(vcContent))}} type="primary"> 验证 </Button>
        </Spin>
      </Modal>

      <Drawer
        title='VC 详情'
        width={700}
        visible={showDetail}
        onClose={() => {
          setCurrentVc(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        <Spin spinning={spinning} tip={tip}>
          <JSONPretty 
            id="json-pretty" 
            data={currentVc} 
            style={{
              // height: '80vh',
              marginTop: '10px'
            }}
          />
          <Button style={{marginTop: 24}} onClick={() => { verifyVc(currentVc) } } type="primary"> 验证 </Button>
        </Spin>

      </Drawer>
    </PageContainer>
  );
};

export default VerifyVc;
