import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography, Input, Button, message } from 'antd';
import { recoverPublicKey, publicKeyToAccount } from '@/utils'
const { TextArea } = Input;

const VerifyVc: React.FC = () => {
  
  const [vcContent, setVcContent] = useState<string>("");

  const verifySig = (): boolean => {

    const jsonData: DID.VcDocument = JSON.parse(vcContent);
    const { info, proof } = jsonData;
    const pubKey = recoverPublicKey(JSON.stringify(info), proof.signature, parseInt(proof.signature.slice(130, 132), 16) - 27);
    const recoverAccount = publicKeyToAccount(pubKey);
    console.log(proof.creator, recoverAccount);
    if(proof.creator.toLowerCase() === recoverAccount.toLowerCase()) 
      return true;

    return false;
  };

  const verifyVC = () => {
    if(verifySig()){
      message.success('提交成功');
    } else {
      message.error("验证VC失败");
    }
  };

  return (
    <PageContainer>
      <Card>
      <Alert 
        message="在输入框输入VC文档" 
        type="info" 
        showIcon 
        banner          
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <TextArea 
        rows={18} 
        autoSize={true}
        onChange={(e) => { 
          setVcContent(e.target.value); 
        }} 
      />
      <Button style={{marginTop: 24}} onClick={verifyVC} type="primary"> 验证 </Button>

      </Card>
    </PageContainer>
  );
};

export default VerifyVc;
