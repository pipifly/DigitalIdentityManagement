import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';


const VerifyVc: React.FC = () => {
  return (
    <PageContainer>
      <Card>
        <Alert
          message={'创建的VC（启用、废除、发送、删除）持有的VC（删除、发送）收件箱，列表收到的VC，直接是已经'}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />
        <Typography.Text strong>
          高级表格{' '}
          <a
            href="https://procomponents.ant.design/components/table"
            rel="noopener noreferrer"
            target="__blank"
          >
            欢迎使用
          </a>
        </Typography.Text>
        <Typography.Text
          strong
          style={{
            marginBottom: 12,
          }}
        >
          高级布局{' '}
          <a
            href="https://procomponents.ant.design/components/layout"
            rel="noopener noreferrer"
            target="__blank"
          >
            欢迎使用
          </a>
        </Typography.Text>
      </Card>
    </PageContainer>
  );
};

export default VerifyVc;
