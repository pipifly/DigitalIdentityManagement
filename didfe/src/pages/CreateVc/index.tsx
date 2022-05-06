import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Input, message, Button, Space, Spin } from 'antd';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { useModel } from 'umi';
import styles from './index.less';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import { signString, enDisableVc } from '@/utils';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

type DataSourceType = {
  id: React.Key;
  keyname?: string;
  value?: string;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = [];

const columns: ProColumns<DataSourceType>[] = [
  {
    title: '键',
    dataIndex: 'keyname',
    width: '35%',
  },
  {
    title: '字段值',
    dataIndex: 'value',
    renderFormItem: (_, { record }) => {
      return <Input addonBefore={(record as any)?.addonBefore} />;
    },
    width: '55%',
  },
  {
    title: '操作',
    valueType: 'option',
    width: '10%',
  },
];

const CreateVc: React.FC = () => {

  const { initialState, setInitialState } = useModel('@@initialState');
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    defaultData.map((item) => item.id),
  );
  const [vc, setVc] = useState<any>({});
  const [spinState, setSpinState] = useState<DID.SpinState>({spinning: false})

  const { web3, account, didInfo } = initialState;

  const formMapVc = async (values: any) => {
    let vcInfo: DID.VcInfo = {
      type: values.type,
      issuer: values.issuerDid,
      holder: values.holderDid,
      issuanceDate: (new Date()).toISOString(),
      credentialSubject:{}
    };
    let vcSubject = {};
    for(let i = 0; i < values.dataSource.length; i++) {
      const l = values.dataSource[i];
      vcSubject = {...vcSubject, ...{[l.keyname]: l.value} };
    }
    vcInfo.credentialSubject = vcSubject;

    const signature: DID.SignResult = await signString(JSON.stringify(vcInfo), web3, account);

    let vcDocument: DID.VcDocument = {
      info: vcInfo,
      proof: {
        creator: account || '',
        type: "Secp256k1",
        signature: signature.signature
      }
    };

    setVc(vcDocument);
    const didAddr = didInfo.address;
    let didsInfo: DID.DidInfo[] = JSON.parse(window.localStorage.getItem('didsDict') || '{}');
    didsInfo[didAddr].createdVcs.push(vcDocument);
    window.localStorage.setItem('didsDict', JSON.stringify(didsInfo));
  };

  const copyVc = () => {
    navigator.clipboard.writeText(JSON.stringify(vc, null, 2));
  }

  const onEnableVc = async () => {
    try {
      setSpinState({spinning: true, tip: "正在启用此 VC"});
      const signature = vc.proof.signature;
      const res_created = await enDisableVc(web3, account, initialState?.didInfo?.address, signature, true);
      if(res_created) {
        message.success("启用此VC成功")
      } else {
        message.error("启用此VC失败")
      }
      
    } catch(error) {
      console.log(error);
    } finally {
      setSpinState({spinning: false});
    };
  }

  const { spinning, tip } = spinState;
  return (
    <PageContainer
      // content="创建VC"
    >

        <ProCard title="填写 VC 信息" gutter={[0, 8]}>
        
          <ProForm<{
            issuerDid: string;
            holderDid: string;
          }>
            submitter={{
              // 配置按钮文本
              searchConfig: {
                submitText: '创建',
                resetText: '重置',
              },
              submitButtonProps: {},
              // 配置按钮的属性
              resetButtonProps: {
                style: {
                  // 隐藏重置按钮
                  // display: 'none',
                },
              },

            }}
            onFinish={async (values) => {
              formMapVc(values);
              message.success('提交成功');
            }}
            onReset={() => {
              setVc({});
            }}
            initialValues={{
              issuerDid: didInfo?.address,
              useMode: 'chapter',
            }}
          >
            <ProForm.Group>
              <ProFormText
                width="lg"
                name="issuerDid"
                label="发行人Did"
                placeholder="issuer Did"
              />
              <ProFormText rules={[{ required: true, message: '请输入持有人 DID' }]} width="lg" name="holderDid" label="持有人Did" placeholder="holder Did" />
            </ProForm.Group>
            <ProFormText rules={[{ required: true, message: '请输入 VC 类型' }]} width="md" name="type" label="VC类型" />
            <ProForm.Item
              label="VC内容"
              name="dataSource"
              initialValue={defaultData}
              trigger="onValuesChange"
            >
              <EditableProTable<DataSourceType>
                rowKey="id"
                toolBarRender={false}
                columns={columns}
                recordCreatorProps={{
                  newRecordType: 'dataSource',
                  position: 'bottom',
                  record: () => ({
                    id: Date.now(),
                    // addonBefore: 'ccccccc',
                    // decs: 'testdesc',
                  }),
                }}
                editable={{
                  type: 'multiple',
                  editableKeys,
                  onChange: setEditableRowKeys,
                  actionRender: (row, _, dom) => {
                    return [dom.delete];
                  },
                }}
              />
            </ProForm.Item>
          </ProForm>
              
        </ProCard>

        <ProCard style={{ marginTop: 8 }} title="VC 文档" bordered>
          <Spin spinning={spinning} tip={tip}>
            <JSONPretty id="json-pretty" data={vc} />
            <Space>
              <Button 
                type="primary" 
                style={{ marginTop: 8 }} 
                onClick={copyVc}
                >
                复制
              </Button>

              <Button 
                type="primary" 
                style={{ marginTop: 8 }} 
                disabled={ vc && Object.getOwnPropertyNames(vc).length > 0 ? false : true } 
                onClick={onEnableVc}
                >
                启用
              </Button>
            </Space>
          </Spin>

        </ProCard>

  
    </PageContainer>
  );
};

export default CreateVc;
