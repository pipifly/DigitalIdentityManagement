declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module '@antv/data-set';
declare module 'mockjs';
declare module 'react-fittext';
declare module 'bizcharts-plugin-slider';

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design Dedicated environment variable, please do not use it in your project.
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined;

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

interface Window {
  ethereum: any
} 

declare module "*.json" {
  const value: any;
  export default value;
}
declare namespace DID {
  
  type CurrentAccount = {
    account?: string;
    holdVc?: any [];
    createdVc: any [];
  }

  type LoginResult = {
    status?: string;
    msg?: string;
  }

  type VcInfo = {
    "type": string;
    "issuer": string;
    "holder": string;
    "issuanceDate": string;
    "credentialSubject": Record<string, any>; 
  }

  type VcProof = {
    "creator": string;
    "type": string;
    "signature": string;
  }

  type VcDocument = {
    info: VcInfo;
    proof: VcProof;
  }

  type SignResult = {
    r: string;
    s: string;
    v: string;
    signature: string;
  }

  type DidInfo = {
    address: string;
    createdVcs: VcDocument[];
    holdedVcs: VcDocument[];
  }

  type SpinState = {
    spinning: boolean; 
    tip?: string;
  }
}

