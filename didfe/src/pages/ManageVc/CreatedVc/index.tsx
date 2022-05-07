import React, { useEffect, useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, message, Modal, Button, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { history, useModel } from 'umi';
import { queryVcEnabled, enDisableVc } from '@/utils';
import { sendVc, getVc } from '@/services/did/api';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import './index.css';

const VerifyVc: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { web3, account, didInfo } = initialState;
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRecord, setCurrentRecord] = useState<DID.CreatedVcListItem>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const getListByParmas = async (parms: DID.PageParams) => {
    const { current = 1, pageSize = 20 } = parms;
    const didAddr = didInfo.address;
    let didsInfo: DID.DidInfo[] = JSON.parse(window.localStorage.getItem('didsDict') || '{}');
    let createdVcs: DID.VcDocument[] = didsInfo[didInfo.address].createdVcs;
    let slicedVcs: DID.VcDocument[] = [...createdVcs].slice(
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
        holder: "0x..." + info.holder.slice(-6),
        createdAt: info.issuanceDate,
        status: (await queryVcEnabled(proof.signature, initialState?.web3, didAddr)) ? 1 : 0,
        vcDoc: item
      })
    }
  
    console.log(dataSource)
    return {
      data: dataSource,
      total: createdVcs.length,
      success: true,
      pageSize,
      current: parseInt(`${current}`, 10) || 1,
    };
  }
  const deleteItem = async (record: DID.CreatedVcListItem) => {
    const hide = message.loading('正在删除');
    try {

      const nowStatus: boolean = record.status === 0 ? false : true;
      if(nowStatus) {
        await enDisableVc(web3, account, didInfo.address, record.vcDoc.proof.signature, false);
    }
    let didsInfo: DID.DidInfo[] = JSON.parse(window.localStorage.getItem('didsDict') || '{}');
    let createdVcs: DID.VcDocument[] = didsInfo[didInfo.address].createdVcs;
    createdVcs.map((item, i) => {
      if(item.proof.signature === record.vcDoc?.proof.signature) {
        createdVcs.splice(i, 1);
      }
    });
    didsInfo[didInfo.address].createdVcs = createdVcs;
    window.localStorage.setItem('didsDict', JSON.stringify(didsInfo));
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
  const toggleStatus = async (record: DID.CreatedVcListItem) => {
    const nowStatus: boolean = record.status === 0 ? false : true;
    const t = nowStatus ? '停用' : '启用'
    const hide = message.loading(`正在${t}` );
    try{
      const res = await enDisableVc(web3, account, didInfo.address, record.vcDoc.proof.signature, !nowStatus);
      hide();
      if(res) {
        message.success(`${t}成功`);
        actionRef.current?.reloadAndRest?.();
        return true;
      } else {
        message.error(`${t}失败，请稍后重试`);
        return false;
      }
    } catch(error) {
      hide();
      message.error(`${t}失败，请稍后重试`);
      return false;
    }

  }

  const sendItem = async (record: DID.CreatedVcListItem) => {
    const hide = message.loading(`正在发送` );
    try{
      const res = await sendVc({
        vcdoc: record.vcDoc,
        type: 0,
        todid: record.vcDoc.info.holder
      });
      hide();
      if(res){
        message.success(`发送成功`);
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
      title: '持有人',
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
          key="toggleStatus"
          onClick={() => {
            toggleStatus(record);
          }}
        >
          {record.status === 0? '启用' : '停用'}
        </a>,
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
            sendItem(record);
          }}
        >
          发送给持有人
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
          <Button
            type='primary'
            key='primary'
            onClick={() => {
              history.push('/createvc');
            }}
          >
            <PlusOutlined /> 新建
          </Button>
        ]}
        request={getListByParmas}
        columns={columns}
      />
      <Button
        onClick={async () => {
          const res = await getVc({todid: didInfo.address, 
                            type: 0
                            });
          console.log(res)
        }}
      >
        getvc
      </Button>
      <Drawer
        width={800}
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
            height: '80vh',
            marginTop: '20px'
          }}
        />

      </Drawer>
    </PageContainer>
  );
};

export default VerifyVc;
