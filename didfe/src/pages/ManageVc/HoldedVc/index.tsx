import React, { useEffect, useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, message, Modal, Button, Input, Drawer } from 'antd';
import { UserOutlined  } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { history, useModel } from 'umi';
import { queryVcEnabled, enDisableVc } from '@/utils';
import { sendVc, getVc, deleteVc } from '@/services/did/api';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import './index.css';

const VerifyVc: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { web3, account, didInfo } = initialState;
  const actionRef = useRef<ActionType>();
  const [currentRecord, setCurrentRecord] = useState<DID.CreatedVcListItem>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [verifyDid, setVerifyDid] = useState<string>();

  const getListByParmas = async (parms: DID.PageParams) => {
    const { current = 1, pageSize = 20 } = parms;
    const didAddr = didInfo.address;
    
    let holdedVcs: DID.VcDocument[] = await getVc({todid: didAddr, type: 0});

    let slicedVcs: DID.VcDocument[] = [...holdedVcs].slice(
      ((current as number) - 1) * (pageSize as number),
      (current as number) * (pageSize as number),
    );
    console.log("slicedVcs", slicedVcs);
    // key?: number;
    // sig?: string;
    // type?: string;
    // holder?: string;
    // createdAt?: string;
    // status?: number;
    // vcDoc?: VcDocument[];
    const dataSource = [];
    for(let index in slicedVcs) {
      const item: DID.VcDocument = slicedVcs[index];
      const { info, proof } = item;
      dataSource.push({
        key: index,
        sig: proof.signature.slice(0, 6),
        type: info.type,
        holder: `${info.holder.slice(0,6)}...${info.holder.slice(-4)}`,
        createdAt: info.issuanceDate,
        status: (await queryVcEnabled(proof.signature, initialState?.web3, didAddr)) ? 1 : 0,
        vcDoc: item
      })
    }
  
    console.log(dataSource)
    return {
      data: dataSource,
      total: holdedVcs.length,
      success: true,
      pageSize,
      current: parseInt(`${current}`, 10) || 1,
    };
  }
  const deleteItem = async (record: DID.CreatedVcListItem) => {
    const hide = message.loading('正在删除');
    try {
      const res = await deleteVc([{todid: didInfo.address, vcsig: record.vcDoc?.proof.signature, type: 0}]);

      hide();
      message.success('删除成功');
      actionRef.current?.reload?.();
      return true;
    } catch(error) {
      hide();
      message.error('删除失败，请稍后重试');
      return false;
    }
  }

  const sendItem = async () => {
    if(!(verifyDid && verifyDid.length > 10)) {
      message.error('请输入正确验证者 did');
      return
    }
    const hide = message.loading(`正在发送` );
    try{
      const res = await sendVc({
        vcdoc: currentRecord.vcDoc,
        type: 1,
        todid: verifyDid,
      });
      hide();
      if(res){
        message.success(`发送成功`);
        setModalVisible(false)
        return true;
      }
      message.error('发送失败，请稍后重试');
      return false
    } catch(error) {
      hide();
      message.error(`发送失败，请稍后重试`);
      return false;
    }
  }

  const columns: ProColumns<DID.CreatedVcListItem>[] = [
    {
      title: 'VC 摘要',
      dataIndex: 'sig',
      tip: 'VC 文档的签名',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log("setShowDetail");
              setCurrentRecord(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        )
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
    },
    {
      title: '发行方',
      dataIndex: 'holder',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt'
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: '未启用',
          status: 'Default'
        },
        1: {
          text: '生效中',
          status: 'Success',
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record: DID.CreatedVcListItem) => [

        <a 
          key="deleteItem" 
          onClick={() => {
            deleteItem(record);
          }}
        >
          删除
        </a>,
        <a 
          key="sendItem" 
          onClick={() => {
            setModalVisible(true);
            setCurrentRecord(record);
          }}
        >
          发送验证
        </a>,
      ],
    }
  ]

  return (
    <PageContainer>
      <ProTable<DID.CreatedVcListItem, DID.PageParams>
        // headerTitle='创建的VC表格'
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
    
        ]}
        request={getListByParmas}
        columns={columns}
      />
      <Modal
        title={`发送给验证人`}
        visible={modalVisible}
        maskClosable
        closable={false}
        onCancel={() => {setModalVisible(false)}}
        onOk={() => {
          sendItem()
        }}
        destroyOnClose
      >
        <Input 
          placeholder="请输入验证人 DID" 
          prefix={<UserOutlined />} 
          onChange={(e) => { 
            setVerifyDid(e.target.value); 
          }} 
        />
        {/* {currentRecord?.sig} */}
      </Modal>
      <Drawer
        title='VC 详情'
        width={700}
        visible={showDetail}
        onClose={() => {
          setCurrentRecord(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        <JSONPretty 
          id="json-pretty" 
          data={currentRecord?.vcDoc} 
          style={{
            // height: '80vh',
            marginTop: '10px'
          }}
        />

      </Drawer>
    </PageContainer>
  );
};

export default VerifyVc;
