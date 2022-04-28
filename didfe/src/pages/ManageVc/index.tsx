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
      </Card>
    </PageContainer>
  );
};

export default VerifyVc;
